/* eslint-env es6 */

"use strict";

const permissionWeights = require("../../authorizer/permissionWeights.js");

module.exports = function(core, config, store) {
	core.on("setstate", changes => {
		let future = store.with(changes),
			mode = future.get("nav", "mode");

		if (mode === "chat") {
			let roomObj = future.getRoom(),
				rel = future.getRelation(),
				readLevel = (roomObj && roomObj.guides && roomObj.guides.authorizer &&
							 roomObj.guides.authorizer.readLevel) ? roomObj.guides.authorizer.readLevel : "guest";

			if (permissionWeights[readLevel] > permissionWeights[rel && rel.role ? rel.role : "guest"]) {
				changes.nav.mode = "room";
			}
		}
	}, 50);
};
