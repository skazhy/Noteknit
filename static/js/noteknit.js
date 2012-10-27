$(function() {
  var knitting_started = false;
  //var context = $("canvas")[0].getContext('2d');
  
  var Note = Backbone.Model.extend({
      audio_id: function(lead){ return lead + "audio" + this.get("tone").replace("/","-"); },
      audio_path: function() { return "mp3/" + this.get("tone") + ".mp3"; },
      play: function() {
          $(this.audio_id("#"))[0].play();
      },
      noteNum: function() {
          return parseInt(this.get("tone").split("/")[1]);
      },
      tempo: function() {
        return Math.round(2000 / this.noteNum());
      },
      playable: function() {
          return (this.get("tone").slice(0,1) != "z");
      },
      preload: function() {
            if(!$(this.audio_id("#")).length) {
               var a = $('<audio>', {src: this.audio_path(), id: this.audio_id("")});
               $("#noteblock").append(a);
            }
      },
      update: function(ev) {
          console.log(ev);
      },
      img: function(incr) {
        var copy = $(".k"+ this.noteNum()).clone();
        copy.attr("id", this.cid);
        copy.addClass("activeNote");
        copy.clientX = 103;
        //song.add(, {silent: true});
     
        this.set("el", copy);
        var me = this;
        copy.bind("dragstop", function(e) {
            me.update(e.clientY);
        });
        copy.css({position: "absolute", left: incr, top: "70px"});
        copy.position(100,0);
        console.log(copy);
        copy.draggable({ revert: "invalid", grid: [40, 15] }).bind("dblclick", function() { 
            song.getByCid($(this).attr("id")).destroy();
            $(this).remove(); });

        $("#notebox").after(copy);
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
            if (played < me.length) {
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
      },
      publish: function() {
          var incr = 500;
          this.each( function(el) {
              el.img(incr);
              incr += 80;
          });
      }
  });
    
  var song = new Song();
  song.on("add", function() {
  });
  song.on("destroy", function(mod) {
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
     copy.attr("id", this.cid);
     copy.addClass("activeNote");
     song.add(note, {silent: true});
     
    note.set("el", copy);
    copy.bind("dragstop", function(e) {
        note.update(e.clientY);
    });
    note.update(event.clientY);
    copy.draggable({ revert: "invalid", grid: [40, 15] }).bind("dblclick", function() { 
        song.getByCid($(this).attr("id")).destroy();
        $(this).remove(); });

    $(this).after(copy);
    
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
        song.publish();
    });
    
    $('.dest').droppable({ });
});
