/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const NotificationItem = require("./notification-item.es6")(core, config, store);

	core.on("note-dn", note => {
		let item = new NotificationItem(note),
			user = store.getUser(),
			show = (user.params && user.params.notifications && user.params.notifications.desktop === false) ? false : true;

		if (show && note.score >= 30) {
			let not = new Notification(item.title, {
				icon: "/s/assets/preview@2x.png",
				body: item.summary,
				tag: note.group + "_" + note.noteType
			});

			not.onclick = () => {
				window.focus();

				item.act();
			};
		}
	}, 1);
};
