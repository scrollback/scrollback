/* jshint browser: true */
/* global $ */

var desktopnotify = require("../lib/desktopnotify.js"),
	formField = require("../ui/utils/form-field.js");

module.exports = function(core) {
	core.on("pref-show", function(tabs, next) {
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

		if (desktopnotify.supported()) {
			if (typeof notifications.desktop !== "boolean" || desktopnotify.supported().permission !== "granted") {
				notifications.desktop = false;
			}

			var $desktoptoggle = formField("Desktop notifications ", "toggle", "desktop-notification", notifications.desktop);

			$div.append($desktoptoggle);

			$desktoptoggle.find("#desktop-notification").on("change", function() {
				if ($(this).is(":checked")) {
					desktopnotify.request();
				}

				if (desktopnotify.supported().permission === "denied") {
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

		next();
	}, 500);

	core.on("pref-save", function(user, next) {
		user.params.notifications = {
			sound: $("#sound-notification").is(":checked"),
			desktop: $("#desktop-notification").is(":checked")
		};

		next();
	}, 500);
};
