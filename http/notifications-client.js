/* eslint-env browser */
/* global $ */

"use strict";

var formField = require("../ui/utils/form-field.js");

module.exports = function(core) {
	core.on("pref-show", function(tabs) {
		var user = tabs.user,
			$div = $("<div>"),
			notifications = user.params.notifications;

		if (!notifications) {
			notifications = {};
		}

		if (typeof notifications.sound !== "boolean") {
			notifications.sound = true;
		}

		var $soundtoggle = formField("Sound notifications ", "toggle", "sound-notification", notifications.sound);

		$div.append($soundtoggle);

		if (window.Notification.supported !== false) {
			if (typeof notifications.desktop !== "boolean" || window.Notification.permission !== "granted") {
				notifications.desktop = false;
			}

			var $desktoptoggle = formField("Desktop notifications ", "toggle", "desktop-notification", notifications.desktop);

			$div.append($desktoptoggle);

			$desktoptoggle.find("#desktop-notification").on("change", function() {
				if ($(this).is(":checked")) {
					window.Notification.requestPermission();
				}

				if (window.Notification.permission === "denied") {
					$(this).attr("checked", false);

					$("<div>").text("Permission for desktop notifications denied!").alertbar({
						type: "error",
						id: "desktopnotify-err-perm-denied"
					});
				}
			});
		}

		tabs.notification = {
			text: "Notifications",
			html: $div
		};
	}, 500);

	core.on("pref-save", function(user) {
		user.params.notifications = {
			sound: $("#sound-notification").is(":checked"),
			desktop: $("#desktop-notification").is(":checked")
		};
	}, 500);
};
