/* jshint browser: true */
/* global _gaq */

"use strict";

module.exports = function(core, config, store) {
	var props;

	if (!("_gaq" in window)) {
		return;
	}

	props = [ "room", "thread", "mode", "dialog", "query" ];

	// Track navigation events
	core.on("statechange", function(changes, next) {
		if (!(changes.nav)) {
			return next();
		}

		props.forEach(function(prop) {
			if (prop in changes.nav) {
				_gaq.push(["_trackEvent", prop, store.get("nav")[prop]]);
			}
		});

		next();
	}, 500);
};
