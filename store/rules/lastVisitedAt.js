"use strict";

module.exports = function(core, config, store) {
	function addFirstVisitedAt(changes) {
		changes.app = changes.app || {};
		changes.app.firstVisitedAt = Date.now();

		core.off("setstate", addFirstVisitedAt);
	}

	core.on("setstate", addFirstVisitedAt, 100);

	core.on("setstate", function(changes, next) {
		var oldroom, newroom, oldmode, newmode,
			oldrel, newrel, future;

		if (changes.nav && ("mode" in changes.nav || "room" in changes.nav)) {
			future = store.with(changes);

			oldroom = store.get("nav", "room");
			oldmode = store.get("nav", "mode");

			newroom = future.get("nav", "room");
			newmode = future.get("nav", "mode");

			if (oldroom || newroom) {
				changes.entities = changes.entities || {};
			}

			if (oldroom && /^(room|chat)$/.test(oldmode)) {
				oldrel = oldroom + "_" + store.get("user");

				changes.entities[oldrel] = changes.entities[oldrel] || {};
				changes.entities[oldrel].lastVisitedAt = Date.now();
			}

			if (newroom && /^(room|chat)$/.test(newmode)) {
				newrel = newroom + "_" + future.get("user");

				changes.entities[newrel] = changes.entities[newrel] || {};
				changes.entities[newrel].lastVisitedAt = null;
			}
		}

		next();
	}, 100);
};
