/* eslint-env browser */

"use strict";

// Polyfill for desktop notifications
(function() {
	if (typeof window.Notification === "function") {
		return;
	}

	function Notification(title, opts) {
		opts = (typeof opts === "object") ? opts : {};

		if (typeof title === "undefined") {
			throw new TypeError("Failed to construct 'Notification': 1 argument required, but only 0 present.");
		}

		this.title = title;

		this.dir = (typeof opts.dir === "string") ? opts.dir : "auto";
		this.lang = (typeof opts.lang === "string") ? opts.lang : "";
		this.body = (typeof opts.body === "string") ? opts.body : "";
		this.tag = (typeof opts.tag === "string") ? opts.tag : "";
		this.icon = (typeof opts.icon === "string") ? opts.icon : "";

		if (typeof window.webkitNotifications !== "undefined") {
			this._instance = window.webkitNotifications.createNotification(this.icon, this.title, this.body);
		} else {
			this._instance = {
				onclick: function() {},
				cancel: function() {}
			};

			this.unsupported === false;
		}

		Object.defineProperty(this, "onclick", {
			get: function() { return this._instance.onclick; },
			set: function(fn) { this._instance.onclick = fn; }
		});

		Object.defineProperty(this, "close", {
			value: this._instance.cancel,
			writable: false
		});

		this._instance.show();
	}

	Object.defineProperty(Notification, "permission", {
		get: function() {
			var permission;

			if (typeof window.webkitNotifications === "undefined") {
				return "denied";
			}

			switch (window.webkitNotifications.checkPermission()) {
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

			return permission;
		},
		writable: false
	});

	Object.defineProperty(Notification, "requestPermission", {
		value: function() {
			if (typeof window.webkitNotifications !== "undefined") {
				return window.webkitNotifications.requestPermission();
			}
		},
		writable: false
	});

	window.Notification = Notification;
}());
