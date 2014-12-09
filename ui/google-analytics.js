/* jshint browser: true */
/* global _gaq, libsb */

(function() {
	var props;

	if (!("_gaq" in window)) {
		return;
	}

	props = [ "roomName", "thread", "mode", "dialog", "tab", "query" ];

	// Track navigation events
	libsb.on("navigate", function(state, next) {
		if (!state.old) {
			return next();
		}

		props.forEach(function(prop) {
			if (state.old[prop] !== state[prop]) {
				_gaq.push(["_trackEvent", prop, state[prop]]);
			}
		});

		next();
	}, 500);
})();
