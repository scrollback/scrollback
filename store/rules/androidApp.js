var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var user = changes.user || store.get("user"),
			dialog = (changes.nav && changes.nav.dialog) ? changes.nav.dialog : store.get("nav", "dialog"),
			env = (changes.context && changes.context.env) ? changes.context.env : store.get("context", "env");

		if (env === "android") {
			changes.nav = changes.nav || {};

			if (user && appUtils.isGuest(user)) {
				changes.nav.dialog = "signin";
				changes.nav.dialogState = "mobile-app";
			} else if (dialog === "signin") {
				changes.nav.dialog = null;
				changes.nav.dialogState = null;
			}
		}

		next();
	}, 100);
};
