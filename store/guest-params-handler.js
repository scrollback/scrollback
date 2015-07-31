/* eslint-env browser */

"use strict";

var userUtils = require("../lib/user-utils.js"),
	LS = window.localStorage;

module.exports = function(core, config, store) {
	var currentNotifications = LS.getItem("notifications");

	try {
		currentNotifications = JSON.parse(currentNotifications);
	} catch (e) {
		currentNotifications = { sound: true };
	}

	core.on("user-dn", function(action, next) {
		var user = action.user;

		if (user.params && user.params.notifications && userUtils.isGuest(store.get("user"))) {
			currentNotifications = user.params.notifications;
			LS.setItem("notifications", JSON.stringify(currentNotifications));
		}

		next();
	}, 1000);

	core.on("setstate", function(changes, next) {
		var user = changes.user || store.get("user");

		if (changes.entities && changes.entities[user] && user && userUtils.isGuest(user)) {
			changes.entities[user].params = changes.entities[user].params || {};
			changes.entities[user].params.notifications = currentNotifications;
		}

		next();
	}, 800);
};
