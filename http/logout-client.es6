/* eslint-env browser */

"use strict";

var appUtils = require("../lib/app-utils.js");

module.exports = function(core, config, store) {
	core.on("user-menu", menu => {
		var user = store.get("user");

		if (!user || appUtils.isGuest(store.get("user"))) {
			return;
		}

		menu.items.logout = {
			text: "Logout",
			prio: 1000,
			action: function() {
				core.emit("logout");
			}
		};
	}, 1000);

	core.on("logout", () => window.location.reload(), 1);
};
