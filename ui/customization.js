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
			libsb.emit("getRooms", { ref: window.currentState.room }, function(err, data) {
				var room = data.results[0];

				room.params.customization = {
					css: customCss
				};

				var roomObj = { to: window.currentState.room, room: room };

				libsb.emit("room-up", roomObj, function(){
					libsb.emit("navigate", {});
				});
			});

		},

		applyCss: function() {
			libsb.emit("getRooms", { ref: window.currentState.room }, function(err, data) {
				var customization = data.results[0].params.customization;

				$("#custom-style").remove();

				if (customization && customization.css) {
					$("<style>").text(customization.css.replace("<", "\\3c").replace(">", "\\3e"))
					.attr("id", "custom-style").appendTo("head");
				}
			});
		}
	};

	window.customStyle = customStyle;
})();
