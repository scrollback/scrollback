/* eslint-env browser */

"use strict";

var objUtils = require("../../lib/obj-utils.js"),
	url = require("../../lib/url.js");

module.exports = function(core, config, store) {
	core.on("setstate", function(changes) {
		var future, context, prevRoom, nextRoom;

		if (changes.nav && changes.nav.room) {
			context = store.get("context", "env");

			if (context === "embed") {
				future = store.with(changes);

				prevRoom = store.get("nav", "room");
				nextRoom = future.get("nav", "room");

				if (prevRoom && prevRoom !== nextRoom) {
					window.open(url.build({
						nav: objUtils.merge(objUtils.clone(store.get("nav")), changes.nav)
					}), "_blank");

					delete changes.nav;
				}
			}
		}
	}, 100);
};
