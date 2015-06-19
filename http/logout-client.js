/* eslint-env browser */

"use strict";

var stringUtils = require("../lib/string-utils.js"),
	UserInfo = require("../lib/user-info.js");

module.exports = function(core, config, store) {
	core.on("user-menu", function(menu, next) {
		var user = store.get("user");

		if (!user || new UserInfo(store.get("user").isGuest())) {
			return next();
		}

		menu.items.logout = {
			text: "Logout",
			prio: 1000,
			action: function() {
				core.emit("logout");
			}
		};

		next();
	}, 1000);

	core.on("logout", function(action, next) {
		core.emit("setstate", {
			nav: { dialog: "logout" }
		});

		next();
	}, 100);

	core.on("logout-dialog", function(dialog, next) {
		dialog.title = "You've been signed out!";
		dialog.action = {
			text: "Go back as guest",
			action: function() {
				window.location.href = stringUtils.stripQueryParam(window.location.href, "d");
			}
		};
		dialog.dismiss = false;

		next();
	}, 500);
};
