var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var dialog = (changes.nav && changes.nav.dialog) ? changes.nav.dialog : store.get("nav", "dialog"),
			userId = changes.user || store.get("user"),
			userObj;

		if (changes.entities) {
			userObj = changes.entities[userId];
		}

		userObj = userObj || store.getUser("userId");

		changes.nav = changes.nav || {};
		changes.nav.dialogState = changes.nav.dialogState || {};

		if (userId) {
			if (appUtils.isGuest(userId)) {
				// User is not signed in
				if (userObj.identities) {
					// Trying to sign up
					changes.nav.dialogState.signingup = true;

					if (!dialog || dialog === "signin") {
						changes.nav.dialog = "signup";
					}
				}
			} else {
				// User is signed in
				if (dialog) {
					if (/(signup|signin)/.test(dialog)) {
						changes.nav.dialog = null;
						changes.nav.dialogState = null;
					} else {
						changes.nav.dialogState.signingup = null;
					}
				}
			}
		}

		next();
	}, 100);
};
