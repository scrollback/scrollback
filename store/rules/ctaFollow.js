"use strict";

var userUtils = require("../../lib/user-utils.js");

module.exports = function(core, config, store) {
	core.on("setstate", function(changes) {
		var future = store.with(changes),
			userId = future.get("user"),
			roomId = future.get("nav", "room"),
			mode = future.get("nav", "mode"),
			cta = future.get("app", "cta"),
			role = future.get("entities", roomId + "_" + userId, "role"),
			roomObj = future.getRoom(roomId);

		changes.app = changes.app || {};

		if (roomObj === "missing") {
			changes.app.cta = null;
		} else if (userId && !userUtils.isGuest(userId) && ((/(visitor|none)/).test(role) || !role) && (/(chat|room)/).test(mode) &&
		    !(roomObj && roomObj.guides && roomObj.guides.authorizer && roomObj.guides.authorizer.openRoom === false)) {
			changes.app.cta = "follow";
		} else if (cta === "follow") {
			changes.app.cta = null;
		}
	}, 400);
};
