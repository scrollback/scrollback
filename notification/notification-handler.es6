/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const user = require("../lib/user.js")(core, config, store),
		  generate = require("../lib/generate.js");

	core.on("notification-dn", notification => {
		core.emit("setstate", {
			notifications: [ notification ]
		});
	}, 100);

	core.on("notification-up", notification => {
		core.emit("setstate", {
			notifications: [ notification ]
		});
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

		// FIXME: ugly hack until messages in hidden threads are no longer received
		if (text.thread) {
			let thread = store.get("indexes", "threadsById", text.thread);

			if (thread && thread.tags.indexOf("thread-hidden") > -1) {
				return;
			}
		}

		let subtype;

		if (text.mentions && text.mentions.indexOf(userId) > -1) {
			subtype = "mention";
		} else {
			let roomId = store.get("nav", "room"),
				mode = store.get("nav", "mode");

			if (text.id === text.thread) {
				let roomId = store.get("nav", "room"),
					mode = store.get("nav", "mode");

				if (roomId === text.to && mode === "room" && !user.isAdmin(userId, roomId)) {
					return;
				}

				subtype = "thread";
			} else {
				let threadId = store.get("nav", "thread");

				if (roomId === text.to && mode === "chat" && ((threadId && threadId === text.thread) || (!threadId && !text.thread))) {
					return;
				}

				subtype = "text";
			}
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
};
