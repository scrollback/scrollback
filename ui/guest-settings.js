/* jshint browser: true */
/* global $, libsb */

libsb.on("auth-menu", function(menu, next) {
	AddItem(menu, "sound");
	//	AddItem(menu, "desktop"); 
	next();
}, 500);



function AddItem(menu, type) {
	var notification = (libsb.user.params.notifications && typeof libsb.user.params.notifications[type] == "boolean") ? libsb.user.params.notifications[type] : true;

	menu.items["guest-" + type + "-notification-" + (notification ? "disable" : "enable")] = {
		text: (notification ? "Disable " : "Enable ") + type + ' notifications',
		prio: 500,
		action: function() {
			var user = $.extend(true, {}, libsb.user);

			if (!user.params.notifications) {
				user.params.notifications = {};
				user.params.notifications[type] = false;
			} else {
				user.params.notifications[type] = !user.params.notifications[type];
			}
			user.params.notifications.desktop = false; // remove this when desktop notification is added to the user menu.
			libsb.emit("user-up", {
				user: user
			}, function() {
				//show toast
			});
		}
	};
}