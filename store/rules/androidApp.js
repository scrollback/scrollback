"use strict";

var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var future = store.with(changes),
			user = future.get("user"),
			dialog = future.get("nav", "dialog"),
			env = future.get("context", "env");

		if (env === "android") {
			changes.nav = changes.nav || {};

			if (user && appUtils.isGuest(user)) {
				changes.nav.dialog = "signin";
				changes.nav.dialogState = changes.nav.dialogState || {};
				changes.nav.dialogState.mobileApp = true;
			} else if (dialog === "signin") {
				changes.nav.dialog = null;
				changes.nav.dialogState = null;
			}
		}

		next();
	}, 900);
};
