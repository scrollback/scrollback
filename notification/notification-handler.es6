/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const generate = require("../lib/generate.js");

	core.on("notification-dn", notification => {
		core.emit("setstate", {
			notifications: [ notification ]
		})
	}, 100);

	core.on("notification-up", notification => {
		core.emit("setstate", {
			notifications: [ notification ]
		})
	}, 100);

	// Create notification events
	core.on("text-dn", text => {
		let userId = store.get("user");

		if (text.from === userId) {
			return;
		}

		if (text.tags && text.tags.indexOf("hidden") > -1) {
			return;
		}

		let subtype;

		if (text.mentions && text.mentions.indexOf(userId) > -1) {
			subtype = "mention"
		} else if (text.id === text.thread) {
			subtype = "thread";
		} else {
			subtype = "text";
		}

		core.emit("notification-dn", {
			id: generate.uid(),
			time: Date.now(),
			type: "notification",
			subtype: subtype,
			action: text,
			status: "unread"
		});
	}, 100);
}
