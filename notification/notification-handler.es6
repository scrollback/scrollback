/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const user = require("../lib/user.js")(core, config, store);

	core.on("note-dn", notification => {
		core.emit("setstate", {
			notifications: [ notification ]
		});
	}, 100);

	core.on("note-up", notification => {
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

		let group = text.to,
			title;

		// FIXME: ugly hack until messages in hidden threads are no longer received
		if (text.thread) {
			let thread = store.get("indexes", "threadsById", text.thread);

			if (thread && thread.tags.indexOf("thread-hidden") > -1) {
				return;
			} else {
				title = thread.title;
				group += "/" + text.thread;
			}
		}

		let roomId = store.get("nav", "room"),
			type;

		if (text.mentions && text.mentions.indexOf(userId) > -1) {
			type = "mention";
		} else {
			let mode = store.get("nav", "mode");

			if (text.id === text.thread) {
				if (roomId === text.to && mode === "room" && !user.isAdmin(userId, roomId)) {
					return;
				}

				type = "thread";
			} else {
				let threadId = store.get("nav", "thread");

				if (roomId === text.to && mode === "chat" && ((threadId && threadId === text.thread) || (!threadId && !text.thread))) {
					return;
				}

				type = "reply";
			}
		}

		core.emit("note-dn", {
			to: store.get("user"),
			action: "text",
			notetype: type,
			group: group,
			count: 1,
			ref: text.id,
			notedata: {
				title: title,
				text: text.text,
				from: text.from
			}
		});
	}, 100);
};
