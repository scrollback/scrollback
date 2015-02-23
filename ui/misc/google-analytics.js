/* jshint browser: true */
/* global _gaq */

module.exports = function(core, config, state) {
	var props;

	if (!("_gaq" in window)) {
		return;
	}

	props = [ "room", "thread", "mode", "dialog", "query" ];

	// Track navigation events
	core.on("statechange", function(changes, next) {
		if (!("nav" in changes)) {
			return next();
		}

		props.forEach(function(prop) {
			if (prop in changes.nav) {
				_gaq.push(["_trackEvent", prop, state.getNav()[prop]]);
			}
		});

		next();
	}, 500);
};
