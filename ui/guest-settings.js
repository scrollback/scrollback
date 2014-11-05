/* global libsb, $ */

libsb.on("auth-menu", function(menu, next) {
	var soundNotification = (libsb.user.params.notification && libsb.user.params.notification.sound);

	menu.items["guest-sound-notification-" + (soundNotification ? "enable" : "disable")] = {
		text: (soundNotification ? "Enable" : "Disable") + ' sound notification',
		prio: 500,
		action: function() {
			var user = $.extend({}, libsb.user);

			if (!user.params.notification) {
				user.params.notification = { sound: true };
			} else {
				user.params.notification.sound = !user.params.notification.sound;
			}

			libsb.emit("user-up", {user: user}, function() {
				//show toast
			});

		}

	};

	next();
}, 500);
