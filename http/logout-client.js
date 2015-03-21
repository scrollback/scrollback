/* jshint browser: true */

var appUtils = require("../lib/app-utils.js");

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

	core.on("logout-dialog", function(dialog, next) {
		dialog.title = "You've been signed out!";
		dialog.action = {
			text: "Go back as guest",
			action: function() {
				core.emit("setstate", {
					nav: { dialog: null }
				}, function() {
					window.location.reload();
				});
			}
		};
		dialog.dismiss = false;

		next();
	}, 500);
};
