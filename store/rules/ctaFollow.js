var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var user = changes.user || store.get("user"),
			room = (changes.nav && changes.nav.room) ? changes.nav.room : store.get("nav", "room"),
			mode = (changes.nav && changes.nav.mode) ? changes.nav.mode : store.get("nav", "mode"),
			cta = (changes.app && changes.app.cta) ? changes.app.cta : store.get("app", "cta"),
			rel;

		if (changes.entities) {
			rel = changes.entities[room + "_" + user];
		}

		rel = rel || store.getRelation(room, user) || {};

		changes.app = changes.app || {};

		if (user && !appUtils.isGuest(user) && ((/(visitor|none)/).test(rel.role) || !rel.role) && (/(chat|room)/).test(mode)) {
			changes.app.cta = "follow";
		} else if (cta === "follow") {
			changes.app.cta = null;
		}

		next();
	}, 400);
};

