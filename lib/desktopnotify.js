/* eslint-env browser */
/* global Notification, webkitNotifications */

/**
 * @fileOverview Wrapper for desktop notifications.
 * @author Satyajit Sahoo <satya@scrollback.io>
 */

"use strict";

var desktopnotify = {
	/**
	 * Check desktop notifications support.
	 * @constructor
	 * @return {{ type: String, permission: String }}
	 */
	supported: function() {
		var type, permission;

		if ("webkitNotifications" in window) {
			type = "webkit";
			switch (webkitNotifications.checkPermission()) {
				case "0":
					permission = "granted";
					break;
				case "2":
					permission = "denied";
					break;
				default:
					permission = "default";
					break;
			}
		} else if ("Notification" in window) {
			type = "html5";

			if (Notification.permission) {
				permission = Notification.permission;
			} else if (Notification.permissionLevel) {
				permission = Notification.permissionLevel();
			}
		} else {
			return false;
		}

		return {
			"type": type,
			"permission": permission
		};
	},

	/**
	 * Request permission for desktop notifications.
	 * @constructor
	 */
	request: function() {
		var check = this.supported();

		if (check.permission !== "granted" && check.permission !== "denied") {
			if (check.type === "webkit") {
				webkitNotifications.requestPermission();
			} else if (check.type === "html5") {
				Notification.requestPermission();
			}
		}
	},

	/**
	 * Show a desktop notification.
	 * @constructor
	 * @param {{ title: String, body: String, tag: String, icon: String, action: Function }} notification
	 */
	show: function(notification) {
		var check = this.supported(),
			n;

		if (check.permission === "granted") {
			if (check.type === "webkit") {
				n = webkitNotifications.createNotification(notification.icon, notification.title, notification.body);
				n.show();
				n.onclick = notification.action;
			} else if (check.type === "html5") {
				n = new Notification(notification.title, {
					dir: "auto",
					lang: "en-US",
					body: notification.body,
					tag: notification.tag,
					icon: notification.icon
				});
				n.onclick = notification.action;
			}
		} else {
			this.request();
		}
	}
};

module.exports = desktopnotify;
