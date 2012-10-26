$(function() {
    var Note = Backbone.Model.extend({
    });

    var Song = Backbone.Collection.extend({
        urlRoot: '/song',
        url: '/song',
        model: Note
    });

    song = new Song();
    console.log(song);
});
