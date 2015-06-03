"use strict";

var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var future = store.with(changes),
			userId = future.get("user"),
			roomId = future.get("nav", "room"),
			mode = future.get("nav", "mode"),
			cta = future.get("app", "cta"),
			role = future.get("entities", roomId + "_" + userId, "role"),
			roomObj = future.getRoom();

		changes.app = changes.app || {};

		if (userId && !appUtils.isGuest(userId) && ((/(visitor|none)/).test(role) || !role) && (/(chat|room)/).test(mode) &&
		    !(roomObj && roomObj.guides && roomObj.guides.authorizer && roomObj.guides.authorizer.openRoom === false)) {
			changes.app.cta = "follow";
		} else if (cta === "follow") {
			changes.app.cta = null;
		}

		next();
	}, 400);
};

