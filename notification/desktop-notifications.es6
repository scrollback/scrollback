/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const NotificationItem = require("./notification-item.es6")(core, config, store),
		  desktopnotify = require("../lib/desktopnotify.js");

	core.on("notification-dn", notification => {
		let item = new NotificationItem(notification),
			user = store.getUser(),
			show = (user.params && user.params.notifications && user.params.notifications.desktop === false) ? false : true;

		if (show) {
			desktopnotify.show({
				title: item.title,
				body: item.summary,
				icon: "/s/assets/logo/scrollback-dark.png",
				tag: notification.id,
				action: () => {
					item.handlers[0]();
					item.dismiss();
				}
			});
		}
	}, 1);
}
