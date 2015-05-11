"use strict";

module.exports = function(core, config, store) {
	function clearNotifications(changes, subtype) {
		let roomId = store.get("nav", "room"),
			all = store.get("notifications"),
			nots;

		nots = all.filter(notification => {
			return (notification.action.to === roomId && notification.subtype === subtype);
		});

		let dismissed = nots.map(notification => {
			return {
				id: notification.id,
				status: "dismissed"
			};
		});

		if (changes.notifications && Array.isArray(changes.notifications)) {
			for (let notification of dismissed) {
				changes.notifications.push(notification);
			}
		} else {
			changes.notifications = dismissed;
		}
	}

	core.on("setstate", function(changes) {
		if (changes.nav.mode || changes.nav.room || "thread" in changes.nav) {
			let mode = store.with(changes).get("nav", "mode");

			if (mode === "chat") {
				clearNotifications(changes, "text");
			} else if (mode === "room") {
				clearNotifications(changes, "thread");
			}
		}
	}, 100);
};
