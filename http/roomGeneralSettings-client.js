// Room general settings
var formField = require("../lib/formField.js");

var div = $('<div>').addClass('list-view list-view-general-settings');
div.append(formField("Name", "text", "displayname"));
div.append(formField("Description", "area", "description"));

libsb.on('config-show', function(conf, next) {
	conf.general = {
		html: div,
		text: "General settings",
		prio: 900
	}
	next();
});

libsb.on('config-save', function(conf, next){
	var name = $('#displayname').val();

	var desc = $('#description').val();
	conf.name = name;
	conf.description = desc;

	next();
});
