var appUtils = require("../lib/appUtils.js");

module.exports = function(core, config, store) {
	function AddItem(menu, type) {
		var user = store.getUser(),
			notification = (user.params.notifications && typeof user.params.notifications[type] == "boolean") ? user.params.notifications[type] : true;

		menu.items["guest-" + type + "-notification-" + (notification ? "disable" : "enable")] = {
			text: (notification ? "Disable " : "Enable ") + type + ' notifications',
			prio: 500,
			action: function() {
				if (!user.params.notifications) {
					user.params.notifications = {};
					user.params.notifications[type] = false;
				} else {
					user.params.notifications[type] = !user.params.notifications[type];
				}

				user.params.notifications.desktop = false; // remove this when desktop notification is added to the user menu.

				core.emit("user-up", { user: user });
			}
		};
	}

	core.on("user-menu", function(menu, next) {
		if (!appUtils.isGuest(store.get("user"))) {
			return next();
		}

		AddItem(menu, "sound");
		//	AddItem(menu, "desktop");
		next();
	}, 500);
};
