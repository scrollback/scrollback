var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var user = changes.user || store.get("user"),
			env = (changes.context && changes.context.env) ? changes.context.env : store.get("context", "env");

		if (appUtils.isGuest(user) && env === "android") {
			changes.nav = changes.nav || {};

			changes.nav.dialog = "signin";
			changes.nav.dialogState = "mobile-app";
		}

		next();
	}, 100);
};
