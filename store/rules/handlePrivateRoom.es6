"use strict";

module.exports = function(core, config, store) {
	core.on("setstate", changes => {
		let future = store.with(changes),
			rel = future.getRelation(),
			room = future.getRoom(),
			mode = future.get("nav", "mode");

		if (!room || (rel && rel.role === "follower")) {
			return;
		}

		if (mode === "chat" && room.guides && room.guides.authorizer && room.guides.authorizer.readLevel === "follower") {
			changes.nav.mode = "room";
		}
	}, 50);
};
