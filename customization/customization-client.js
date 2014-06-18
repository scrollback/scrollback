/* jshint browser: true */
/* global $, libsb */

var formField = require("../lib/formField.js");

libsb.on("config-show", function(tabs, next) {
	var results = tabs.room;

	if (!results.params.customization) {
		results.params.customization = {};
	}

	if (!results.params.customization.css) {
		results.params.customization.css = "";
	}

	var $div = $("<div>").append(formField("Custom CSS", "area", "custom-css", results.params.customization.css));

	tabs.customization = {
		text: "Customization",
		html: $div,
		prio: 300
	};

	next();
});

libsb.on("config-save", function(room, next){
	if (!room.params.customization) {
		room.params.customization = {};
	}

	room.params.customization.css = $("#custom-css").val();

	next();
});
