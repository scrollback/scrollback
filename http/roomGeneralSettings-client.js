// Room general settings
var formField = require("../lib/formField.js");

libsb.on('config-show', function(conf, next) {
	conf.general = {
		html: "<div class='pane pane-general-settings'>" + formField("Name", "text", "displayname") + formField("Description", "area", "description") + "</div>",
		text: "General settings",
		prio: 900
	}
	next();
});

libsb.on('config-save', function(conf, next){
	var name = $('.pane-general-settings #displayname').val();

	var desc = $('.pane-general-settings #description').val();
	conf.name = name;
	conf.description = desc;

	next();
});