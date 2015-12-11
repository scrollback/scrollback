/* eslint-env browser */
/* global $ */

var formField = require("../ui/utils/form-field.js");

module.exports = function(core) {
	 core.on("conf-show", function(tabs, next) {
		var results = tabs.room;

		if (!results.params.http) {
			results.params.http = { seo: true };
		}

		var $div = $("<div>").append(formField("Allow search engines to index room", "toggle", "seo-allow-index", results.params.http.seo));

		tabs.seo = {
			text: "Search visibility",
			html: $div
		};

		next();
	}, 500);

	core.on("conf-save", function(room, next) {
		room.params.http = room.params.http || {};
		room.params.http.seo = $("#seo-allow-index").is(":checked");

		next();
	}, 500);
};
