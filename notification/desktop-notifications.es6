/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const NotificationItem = require("./notification-item.es6")(core, config, store);

	core.on("notification-dn", notification => {
		let item = new NotificationItem(notification),
			user = store.getUser(),
			show = (user.params && user.params.notifications && user.params.notifications.desktop === false) ? false : true;

		if (show) {
			let not = new Notification(item.title, {
				body: item.summary,
				icon: "/s/assets/preview@2x.png",
				tag: notification.id
			});

			not.onclick = () => {
				window.focus();

				item.handlers[0]();
				item.dismiss();
			};
		}
	}, 1);
};
