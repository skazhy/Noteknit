$(function() {
    var Note = Backbone.Model.extend({
    });

    var Song = Backbone.Collection.extend({
        urlRoot: '/song',
        url: '/song',
        model: Note
    });
    
    var NoteView = Backbone.View.extend({
    });
    $("#notebox").draggable({ handle: "#mover" });
    $('.note').draggable({
        revert: "invalid",
        helper: "clone",
    }).bind('dragstop', function(event, ui) {
     // TODO: add to song here
     $(this).after($(ui.helper)
        .clone()
        .draggable({ revert: "invalid", grid: [10, 20] })
        .bind("dblclick", function() { $(this).remove(); }));
    });
    
    $('.dest').droppable({ });
});
