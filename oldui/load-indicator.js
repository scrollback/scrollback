/* jshint browser: true */
/* global $, libsb */

$(function() {
	libsb.on("navigate", function(state, next) {
		if ("mode" in state.changes) {
			// We aren't really certain if the classes are added to body yet
			$.progressbar("dismiss");
		}

		next();
	}, 100);
});
