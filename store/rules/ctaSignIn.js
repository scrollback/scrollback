"use strict";

var userUtils = require("../../lib/user-utils.js");

module.exports = function(core, config, store) {
	core.on("setstate", function(changes) {
		var future = store.with(changes),
			mode = future.get("nav", "mode"),
			user = future.get("user"),
			cta = future.get("app", "cta");

		changes.app = changes.app || {};

		if (user && userUtils.isGuest(user) && mode !== "home") {
			changes.app.cta = "signin";
		} else if (cta === "signin") {
			changes.app.cta = null;
		}
	}, 400);
};

