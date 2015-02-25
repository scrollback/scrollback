/* jshint browser: true */
/* global $ */

module.exports = function(core, config, store) {
	// Customization API (temporary)
	var customStyle = {
		setCss: function(customCss) {
			var room = store.getRoom();

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

			core.emit("room-up", { to: store.getNav().room, room: room });
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

	core.on("statechange", function(changes, next) {
		if ((changes.nav && "room" in changes.nav) || changes.entities && store.getNav().room in changes.entities) {
			customStyle.applyCss(store.getRoom());
		}

		next();
	}, 700);

	window.customStyle = customStyle;
};
