var appUtils = require("../lib/appUtils.js");

module.exports = function(core, config, store) {
	core.on("user-menu", function(menu, next) {
		if (appUtils.isGuest(store.get("user"))) {
			return next();
		}

		menu.items.logout = {
			text: "Logout",
			prio: 1000,
			action: function() {
				core.emit("logout");
			}
		};

		next();
	}, 1000);

	core.on("logout", function(action, next) {
		core.emit("setstate", {
			nav: { dialog: "logout" }
		});

		next();
	}, 100);
};
