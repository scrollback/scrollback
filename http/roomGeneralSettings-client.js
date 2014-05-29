// Room general settings
var formField = require("../lib/formField.js");

libsb.on('config-show', function(tabs, next) {
    var div = $('<div>').addClass('list-view list-view-general-settings');
    var displayname = formField("Name", "text", "displayname", tabs.room.id);
    var description = formField("Description", "area", "description", tabs.room.description);
    
    div.append(displayname, description);
    
    tabs.general = {
        html: div,
        text: "General settings",
        prio: 900
    };

    next();
});

libsb.on('config-save', function(room, next){
    var name = $('#displayname').val();
    var desc = $('#description').val();
    room.name = name;
    room.description = desc;

    next();
});
