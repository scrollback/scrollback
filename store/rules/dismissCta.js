module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var dismissed, cta;

		dismissed = store.get("app", "dismissedCtas") || [];

		if (store.get("app", "connectionStatus") === "online") {
			if (changes.app) {
				if (changes.app.dismissedCtas) {
					dismissed = dismissed.concat(changes.app.dismissedCtas || []);
				}

				cta = changes.app.cta;
			} else {
				changes.app = {};
			}

			cta = cta || store.get("app", "cta");

			if (dismissed.indexOf(cta) > -1) {
				changes.app.cta = null;
			}
		} else {
			changes.app = changes.app || {};
			changes.app.cta = null;
		}

		next();
	}, 100);
};
