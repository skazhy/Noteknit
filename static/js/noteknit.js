$(function() {
    var Note = Backbone.Model.extend({
    });

    var Song = Backbone.Collection.extend({
        urlRoot: '/song',
        url: '/song',
        model: Note,
        outputCode: function() {
            console.log(this.map(function(e) { return e.get("el").position(); }));
        }
    });
    
    var song = new Song();
    song.on("add", function() {
        this.outputCode();
    });
    song.on("destroy", function() {
        this.outputCode();
    });
    
    $("#notebox").draggable({ handle: "#mover" });
    $('.note').draggable({
        revert: "invalid",
        helper: "clone",
    }).bind('dragstop', function(event, ui) {
     var note = new Note();
     var copy = $(ui.helper).clone();
     copy.attr("id", note.cid);
     copy.bind("dragstop", function() {
         song.outputCode();
     });
     note.set("el", copy);
     song.add(note);
     copy.draggable({ revert: "invalid", grid: [10, 20] }).bind("dblclick", function() { 
         song.getByCid($(this).attr("id")).destroy();
         $(this).remove(); });

     $(this).after(copy);
    });
    
    $('.dest').droppable({ });
});
