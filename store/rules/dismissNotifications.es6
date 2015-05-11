"use strict";

module.exports = function(core, config, store) {
	function clearNotifications(changes, subtype, filters) {
		let all = store.get("notifications"),
			nots;

		nots = all.filter(notification => {
			let filter = (notification.subtype === subtype);

			if (filter) {
				for (let f in filters) {
					filter = (filter && notification.action[f] === filters[f]);

					if (!filter) {
						break;
					}
				}
			}

			return filter;
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
			let future = store.with(changes),
				roomId = future.get("nav", "room"),
				mode = future.get("nav", "mode");

			if (mode === "chat") {
				let threadId = future.get("nav", "thread");

				if (threadId) {
					clearNotifications(changes, "text", {
						to: roomId,
						thread: threadId
					});
				} else {
					clearNotifications(changes, "text", { to: roomId });
				}
			} else if (mode === "room") {
				clearNotifications(changes, "thread", { to: roomId });
			}
		}
	}, 100);
};
