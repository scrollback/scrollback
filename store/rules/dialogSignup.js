"use strict";

var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var future = store.with(changes),
			signingup = future.get("nav", "dialogState", "signingup"),
			signedin = future.get("nav", "dialogState", "signedin"),
			dialog = future.get("nav", "dialog"),
			userId = future.get("user"),
			currentDialog = store.get("nav", "dialog");

		changes.nav = changes.nav || {};
		changes.nav.dialogState = changes.nav.dialogState || {};

		// Reset signing up in case dialog is being dismissed
		if (currentDialog && !dialog && signingup) {
			changes.nav.dialogState.signingup = null;
		}

		if (userId) {
			if (appUtils.isGuest(userId)) {
				// User is not signed in
				if (signedin) {
					changes.nav.dialogState.signedin = null;
				}

				if (signingup) {
					// Trying to sign up
					if ((!dialog && !/(signup|signin)/.test(currentDialog)) || dialog === "signin") {
						changes.nav.dialog = "signup";
					}
				}
			} else {
				// User is signed in
				changes.nav.dialogState.signedin = true;

				if (/(signup|signin)/.test(dialog)) {
					changes.nav.dialog = null;
					changes.nav.dialogState = null;
				} else if (signingup) {
					changes.nav.dialogState.signingup = null;
				}
			}
		}

		next();
	}, 100);
};
