/* eslint-env es6 */

"use strict";

module.exports = (core, config, store) => {
	core.on("setstate", changes => {
		if (changes.nav.mode || changes.nav.room || "thread" in changes.nav) {
			let future = store.with(changes),
				roomId = future.get("nav", "room"),
				mode = future.get("nav", "mode");

			if (mode === "chat") {
				let threadId = future.get("nav", "thread");

				if (threadId) {
					core.emit("note-up", {
						group: roomId + "/" + threadId,
						dismissTime: Date.now()
					});
				} else {
					core.emit("note-up", {
						noteType: "reply",
						group: roomId,
						dismissTime: Date.now()
					});
				}
			} else if (mode === "room") {
				core.emit("note-up", {
					noteType: "thread",
					group: roomId,
					dismissTime: Date.now()
				});
			}
		}
	}, 100);
};
