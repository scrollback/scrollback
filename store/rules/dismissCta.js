"use strict";

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var dismissed = store.get("app", "dismissedCtas"),
			changed, cta;

		dismissed = Array.isArray(dismissed) ? dismissed.slice(0) : [];

		if (changes.app) {
			changed = changes.app.dismissedCtas;

			if (changed) {
				for (var i = 0, l = changed.length; i < l; i++) {
					if (dismissed.indexOf(changed[i]) === -1) {
						dismissed.push(changed[i]);
					}
				}
			}
		} else {
			changes.app = {};
		}

		cta = store.with(changes).get("app", "cta");

		if (dismissed.indexOf(cta) > -1) {
			changes.app.cta = null;
		}

		next();
	}, 100);
};
