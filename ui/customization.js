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
            var room = window.currentState.room, roomObj;
            room.params.customization = {
                css: customCss
            };
            roomObj = { to: window.currentState.roomName, room: room }
            
            
            libsb.emit("room-up", roomObj, function(){
                libsb.emit("navigate", {});
            });
		},

		applyCss: function() {
			var room = window.currentState.room;
            var customization = room.params.customization;

            $("#custom-style").remove();

            if (customization && customization.css) {
                $("<style>").text(customization.css.replace("<", "\\3c").replace(">", "\\3e"))
                .attr("id", "custom-style").appendTo("head");
            }
		}
	};

	window.customStyle = customStyle;
})();