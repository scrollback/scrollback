/* jshint browser: true */
/* global $, libsb */

//var formField = require("../lib/formField.js");

$(function() {
//	libsb.on("config-show", function(tabs, next) {
//		var results = tabs.room;
//
//		if (!results.guides) {
//			results.guides = {};
//		}
//
//		if (!results.guides.customization) {
//			results.guides.customization = {};
//		}
//
//		if (!results.guides.customization.css) {
//			results.guides.customization.css = "";
//		}
//
//		var $div = $("<div>").append(formField("Custom CSS", "area", "custom-css", results.guides.customization.css));
//
//		tabs.customization = {
//			text: "Customization",
//			html: $div,
//			prio: 300
//		};
//
//		next();
//	}, 500);
//
//	libsb.on("config-save", function(room, next){
//		if (!room.guides.customization) {
//			room.guides.customization = {};
//		}
//
//		room.guides.customization.css = $("#custom-css").val().replace("<", "\\3c").replace(">", "\\3e");
//
//		next();
//	}, 500);

	libsb.on("navigate", function(state, next) {
		if (state.old && state.roomName !== state.old.roomName && typeof state.room == "object") {
			customStyle.applyCss();
		}
		next();
	}, 700);

	libsb.on("room-dn", function(room, next) {
		customStyle.applyCss();

		next();
	}, 100);

	// Customization API (temporary)
	var customStyle = {
		setCss: function(customCss) {
			var room = $.extend({}, window.currentState.room),
				roomObj;

			if (!(room && typeof customCss === "string")) {
				return;
			}

			if (!room.guides) {
				room.guides = {};
			}

			if (!room.guides.customization) {
				room.guides.customization = {};
			}

			room.guides.customization.css = customCss.replace("<", "\\3c").replace(">", "\\3e");

			roomObj = { to: window.currentState.roomName, room: room };

			libsb.emit("room-up", roomObj);
		},

		applyCss: function() {
			var room = window.currentState.room,
				customization;

			if (!room || !room.guides || !room.guides.customization) {
				return;
			}

			customization = room.guides.customization;

			$("#scrollback-custom-style").remove();

			if (customization && customization.css) {
				$("<style>").text(customization.css)
				.attr("id", "scrollback-custom-style").appendTo("head");
			}
		}
	};

	window.customStyle = customStyle;
});
