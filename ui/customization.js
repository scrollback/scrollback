/* jshint browser: true */
/* global $, libsb */

(function() {
	libsb.on("navigate", function(state, next) {
		if (state.old && state.room !== state.old.room) {
			libsb.emit("getRooms", { ref: state.room }, function(err, data) {
				var customization = data.results[0].params.customization;

				$("#custom-style").remove();

				if (customization && customization.stylesheet) {
					$("<style>").text(customization.stylesheet.replace("<", "\\3c").replace(">", "\\3e"))
					.attr("id", "custom-style").appendTo("head");
				}
			});
		}

		next();
	});
})();
