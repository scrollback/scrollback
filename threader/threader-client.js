/* jshint browser: true */
/* global $, libsb */

var formField = require("../ui/helpers/form-field.js");

libsb.on('conf-show', function(tabs, next) {
	var results = tabs.room;

	if (!results.params.threader) {
		results.params.threader = {
			enabled: true
		};
	}

	var $div = $('<div>').append(formField("Automatically group text into discussions", "toggle",
										   "threader-allow-threading", results.params.threader.enabled));

	tabs.threader = {
		text: "Discussions",
		html: $div,
		prio: 400
	};

	next();
}, 500);

libsb.on('conf-save', function(room, next) {
	if (!room.params.threader) room.params.threader = {};
	room.params.threader.enabled = $('#threader-allow-threading').is(':checked');
	next();
}, 500);
