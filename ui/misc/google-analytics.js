/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	if (!("_gaq" in window)) {
		return;
	}

	let props = [ "room", "thread", "mode", "dialog", "query" ];

	// Track navigation events
	core.on("statechange", changes => {
		if (!(changes.nav)) {
			return;
		}

		props.forEach(prop => {
			if (prop in changes.nav) {
				window._gaq.push(["_trackEvent", prop, store.get("nav")[prop]]);
			}
		});
	}, 500);
};
