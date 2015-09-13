/* eslint-env browser */

"use strict";

module.exports = (core, config, store) => {
	const NotificationItem = require("./notification-item.js")(core, config, store);

	core.on("note-dn", note => {
		if (typeof note.dismissTime === "number" || note.score < 70) {
			return;
		}

		let roomId = store.get("nav", "room"),
			mode = store.get("nav", "mode");

		if (mode === "chat" && /^(reply|mention)$/.test(note.noteType)) {
			let threadId = store.get("nav", "thread");

			if (threadId && note.group === roomId + "/" + threadId) {
				return;
			} else if (note.group === roomId) {
				return;
			}
		} else if (mode === "room" && note.noteType === "thread") {
			return;
		}

		let user = store.getUser();

		if (user.params && user.params.notifications && user.params.notifications.desktop === false) {
			return;
		}

		let item = new NotificationItem(note),
			not = new Notification(item.title, {
				icon: "/s/assets/preview@2x.png",
				body: item.summary,
				tag: note.group + "_" + note.noteType
			});

		not.onclick = () => {
			window.focus();

			item.act();
		};
	}, 1);
};
