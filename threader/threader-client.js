/* jshint browser: true */
/* global $ */

var formField = require("../ui/utils/form-field.js");

module.exports = function(core) {
	core.on("conf-show", function(tabs, next) {
		var results = tabs.room;

		if (!results.params.threader) {
			results.params.threader = {
				enabled: true
			};
		}

		var $div = $("<div>").append(formField("Automatically group text into discussions", "toggle",
											   "threader-allow-threading", results.params.threader.enabled));

		tabs.threader = {
			text: "Discussions",
			html: $div
		};

		next();
	}, 400);

	core.on("conf-save", function(room, next) {
		if (!room.params.threader) {
			room.params.threader = {};
		}

		room.params.threader.enabled = $("#threader-allow-threading").is(":checked");
		next();
	}, 500);
};
