// Room general settings
var formField = require("../lib/formField.js");

libsb.on('config-show', function(conf, next) {
	conf.general = {
		html: "<div class='list-view list-view-general-settings'>" + formField("Name", "text", "displayname") + formField("Description", "area", "description") + "</div>",
		text: "General settings",
		prio: 900
	}
	next();
});

libsb.on('config-save', function(conf, next){
	var name = $('.list-view-general-settings #displayname').val();

	var desc = $('.list-view-general-settings #description').val();
	conf.name = name;
	conf.description = desc;

	next();
});
