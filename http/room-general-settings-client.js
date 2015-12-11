/* eslint-env browser */
/* global $ */

var formField = require("../ui/utils/form-field.js");

module.exports = function(core) {
	core.on("conf-show", function(tabs, next) {
		var $div = $("<div>").append(
			formField("Description", "area", "room-settings-description", tabs.room.description)
		);

		tabs.general = {
			text: "General settings",
			html: $div
		};

		next();
	}, 900);

	core.on("conf-save", function(room, next) {
		var desc = $("#room-settings-description").val();

		room.description = desc;

		next();
	}, 500);
};
