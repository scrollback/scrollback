/* jshint browser: true */
/* global $, libsb */

$(function() {
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

		applyCss: function(room) {
			var customization;

			$("#scrollback-custom-style").remove();

			if (!(room && room.guides && room.guides.customization)) {
				return;
			}

			customization = room.guides.customization;

			if (customization && customization.css) {
				$("<style>").text(customization.css).attr("id", "scrollback-custom-style").appendTo("head");
			}
		}
	};

	libsb.on("navigate", function(state, next) {
		if ("roomName" in state.changes) {
			customStyle.applyCss(state.room);
		}

		next();
	}, 700);

	libsb.on("room-dn", function(data, next) {
		customStyle.applyCss(data.room);

		next();
	}, 100);

	window.customStyle = customStyle;
});
