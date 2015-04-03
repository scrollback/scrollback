var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var future = store.with(changes),
			user = future.get("user"),
			cta = future.get("app", "cta");

		changes.app = changes.app || {};

		if (user && appUtils.isGuest(user)) {
			changes.app.cta = "signin";
		} else if (cta === "signin") {
			changes.app.cta = null;
		}

		next();
	}, 400);
};

