var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var user = changes.user || store.get("user"),
			env = (changes.context && changes.context.env) ? changes.context.env : store.get("context", "env");

		if (env === "android" && user && appUtils.isGuest(user)) {
			changes.nav = changes.nav || {};
			changes.nav.dialog = "signin";
			changes.nav.dialogState = changes.nav.dialogState || {};
			changes.nav.dialogState.mobileApp = true;
		}

		next();
	}, 500);
};
