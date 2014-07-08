/* jshint browser: true */
/* global $, libsb */

//var formField = require("../lib/formField.js");

$(function() {
//	libsb.on("config-show", function(tabs, next) {
//		var results = tabs.room;
//
//		if (!results.params.customization) {
//			results.params.customization = {};
//		}
//
//		if (!results.params.customization.css) {
//			results.params.customization.css = "";
//		}
//
//		var $div = $("<div>").append(formField("Custom CSS", "area", "custom-css", results.params.customization.css));
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
//		if (!room.params.customization) {
//			room.params.customization = {};
//		}
//
//		room.params.customization.css = $("#custom-css").val().replace("<", "\\3c").replace(">", "\\3e");
//
//		next();
//	}, 500);

	libsb.on("navigate", function(state, next) {
		if (state.old && state.room !== state.old.room) {
			customStyle.applyCss();
		}

		next();
	}, 700);

	libsb.on("room-dn", function(room, next) {
		customStyle.applyCss();

		next();
	}, 100);

	// Customization API
	var customStyle = {
		setCss: function(customCss) {
			var room = window.currentState.room,
				roomObj;

			if (!room || !room.params) {
				return;
			}

			if (!room.params.customization) {
				room.params.customization = {};
			}

			room.params.customization.css = customCss;

			roomObj = { to: window.currentState.roomName, room: room };

			libsb.emit("room-up", roomObj);
		},

		applyCss: function() {
			var room = window.currentState.room,
				customization;

			if (!room || !room.params || !room.params.customization) {
				return;
			}

			customization = room.params.customization;

			$("#custom-style").remove();

			if (customization && customization.css) {
				$("<style>").text(customization.css.replace("<", "\\3c").replace(">", "\\3e"))
				.attr("id", "custom-style").appendTo("head");
			}
		}
	};

	window.customStyle = customStyle;
});
