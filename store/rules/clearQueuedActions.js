"use strict";

module.exports = (core, config, store) => {
	core.on("setstate", changes => {
		if (changes.nav && ("mode" in changes.nav || "room" in changes.nav || "thread" in changes.nav) && store.get("app", "queuedActions")) {
			changes.app = changes.app || {};
			changes.app.queuedActions = null;
		}
	}, 100);
};
