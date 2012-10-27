$(function() {
  var knitting_started = false;
  var context = $("canvas")[0].getContext('2d');
  
  var Note = Backbone.Model.extend({
      audio_id: function(lead){ return lead + "audio" + this.get("tone").replace("/","-"); },
      audio_path: function() { return "mp3/" + this.get("tone") + ".mp3"; },
      play: function() {
          $(this.audio_id("#"))[0].play();
      },
      tempo: function() {
        return Math.round(2000 / parseInt(this.get("tone").split("/")[1]));
      },
      playable: function() {
          return (this.get("tone").slice(0,1) != "z");
      },
      preload: function() {
            if(!$(this.audio_id("#")).length) {
               var a = $('<audio>', {src: this.audio_path(), id: this.audio_id("")});
               $("#noteblock").append(a);
            }
      }
  });

  var Song = Backbone.Collection.extend({
      urlRoot: '/song',
      url: '/song',
      model: Note,
      outputCode: function() {
        var map = this.map(function(e) { return e.get("el").position(); });
        var sortedMap = _.sortBy(map, function(m) { return m.left });
        $("#output").text(_.map(sortedMap, function(m) { return Math.round(m.top) }));
        return _.map(sortedMap, function(m) { return Math.round(m.top) });
      },
      preload: function() {
          this.each(function(note) {
              note.preload();
        });
      },
      play: function() {
          var played = 0;
          this.preload();
          var me = this;
           function note_play() {
            console.log(1);
            if (played < me.length) {
                console.log(me.at(played));
                if (me.at(played).playable()) {
                    me.at(played).play();
                }
                setTimeout(function() { note_play() }, me.at(played).tempo()   );
                played++;
            } else {
                played = 0;
            }
        }
        note_play();
      }
  });
    
  var song = new Song();
  song.on("add", function() {
      //this.outputCode();
  });
  song.on("destroy", function(mod) {
      this.outputCode();
  });
  song.on("reset", function() { $(".activeNote").remove(); });
    
  $("#notebox").draggable({ handle: "#mover" });
    $('.note').draggable({
        revert: "invalid",
        helper: "clone",
    }).bind('dragstop', function(event, ui) {
     var note = new Note();
     note.on("destroy", function() {
     });
     var copy = $(ui.helper).clone();
     copy.attr("id", note.cid);
     copy.addClass("activeNote");
     song.add(note, {silent: true});
     
    copy.bind("dragstop", function() {
        song.outputCode();
    });
    note.set("el", copy);
    copy.draggable({ revert: "invalid", grid: [40, 15] }).bind("dblclick", function() { 
        song.getByCid($(this).attr("id")).destroy();
        $(this).remove(); });

    $(this).after(copy);
    song.outputCode();
    
   });
   $("#save-button").click(function() {
       var map = song.outputCode();
       var name = $("#song-name").val();
        $.post("http://localhost:4567/song/", {song: map, name: name}); 
    });

    $("#textarea-button").click(function() {
        song.reset();
        var ta = $("#textarea").val();
        var tones = ta.split(" ");
        for(var i=0;  i < tones.length; i++) {
            if (!tones[i].length) continue;
            var n = new Note({tone: tones[i]});
            song.add(n);
        }
        song.play();
    });
    
    $('.dest').droppable({ });
});
