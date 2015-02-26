/* jshint browser: true */
/* global $, libsb */

// Room general settings
var formField = require("../ui/helpers/form-field.js");

libsb.on('conf-show', function(tabs, next) {
	var $div = $('<div>').append(
		formField("Description", "area", "description", tabs.room.description)
	);

	tabs.general = {
		text: "General settings",
		html: $div,
		prio: 900
	};

	next();
}, 500);

libsb.on('conf-save', function(room, next) {
	var desc = $('#description').val();

	room.description = desc;

	next();
}, 500);
