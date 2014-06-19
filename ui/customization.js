/* jshint browser: true */
/* global $, libsb */

(function() {
	libsb.on("navigate", function(state, next) {
		if (state.old && state.room !== state.old.room) {
			customStyle.applyCss();
		}

		next();
	});

	libsb.on("room-dn", function(room, next) {
		customStyle.applyCss();

		next();
	});

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
})();
