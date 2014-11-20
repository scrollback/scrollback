/* jshint browser: true */
/* global $, libsb */

libsb.on("auth-menu", function(menu, next) {
	var soundNotification = (libsb.user.params.notifications && typeof libsb.user.params.notifications.sound == "boolean")? libsb.user.params.notifications.sound: true;

	menu.items["guest-sound-notification-" + (soundNotification ? "disable" : "enable")] = {
		text: (soundNotification ? "Disable" : "Enable") + ' sound notifications',
		prio: 500,
		action: function() {
			var user = $.extend({}, libsb.user);

			if (!user.params.notifications) {
				user.params.notifications = { sound: true };
			} else {
				user.params.notifications.sound = !user.params.notifications.sound;
			}

			libsb.emit("user-up", {user: user}, function() {
				//show toast
			});

		}

	};

	next();
}, 500);
