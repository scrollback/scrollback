var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var future = store.with(changes),
			user = future.get("user"),
			room = future.get("nav", "room"),
			mode = future.get("nav", "mode"),
			cta = future.get("app", "cta"),
			rel = future.getRelation(room, user) || {};

		changes.app = changes.app || {};

		if (user && !appUtils.isGuest(user) && ((/(visitor|none)/).test(rel.role) || !rel.role) && (/(chat|room)/).test(mode)) {
			changes.app.cta = "follow";
		} else if (cta === "follow") {
			changes.app.cta = null;
		}

		next();
	}, 400);
};

