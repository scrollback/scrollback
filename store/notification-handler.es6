/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	core.on("notification-dn", action => {
		core.emit("setstate", {
			notifications: [ action.notification ]
		})
	}, 100);

	core.on("notification-up", action => {
		core.emit("setstate", {
			notifications: [ action.notification ]
		})
	}, 100);

	function loadNotifications(stringData) {
		let notifications;

		try {
			notifications = JSON.parse(stringData);
		} catch (e) {
			console.log("Error parsing notifications", e);
		}

		if (notifications) {
			core.emit("setstate", { notifications: notifications });
		}
	}

	// load notifications from localStorage
	core.on("boot", () => {
		let notifications;

		try {
			notifications = window.localStorage.getItem("notifications");
		} catch (e) {
			console.log("Error getting notifications from storage", e);
		}

		if (notifications) {
			loadNotifications(notifications);
		}
	}, 1);

	// keep notifications in sync across windows
	window.addEventListener("storage", e => {
		if (e.key === "notifications") {
			loadNotifications(e.newValue);
		}
	}, false);

	// store notifications in localStorage
	core.on("statechange", changes => {
		if (changes.notifications) {
			let notifications = store.get("notifications");

			try {
				window.localStorage.setItem("notifications", JSON.stringify(notifications))
			} catch (e) {
				console.log("Error saving notifications", e);
			}
		}

	}, 1);
}
