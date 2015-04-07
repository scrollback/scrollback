var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var user = changes.user || store.get("user"),
			mode = (changes.nav && changes.nav.mode) ? changes.nav.mode : store.get("nav", "mode"),
			cta = (changes.app && changes.app.cta) ? changes.app.cta : store.get("app", "cta");

		changes.app = changes.app || {};

		if (user && appUtils.isGuest(user) && mode !== "home") {
			changes.app.cta = "signin";
		} else if (cta === "signin") {
			changes.app.cta = null;
		}

		next();
	}, 400);
};

