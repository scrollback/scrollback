"use strict";

module.exports = (core, config, store) => {
	core.on("setstate", function(changes) {
		if (changes.nav.mode || changes.nav.room || "thread" in changes.nav) {
			let roomId = store.get("nav", "room"),
				mode = store.get("nav", "mode");

			if (mode === "chat") {
				let threadId = store.get("nav", "thread");

				if (threadId) {
					core.emit("note-up", {
						group: roomId + "/" + threadId,
						dismissTime: Date.now()
					});
				} else {
					core.emit("note-up", {
						notetype: "reply",
						group: roomId,
						dismissTime: Date.now()
					});
				}
			} else if (mode === "room") {
				core.emit("note-up", {
					notetype: "thread",
					group: roomId,
					dismissTime: Date.now()
				});
			}
		}
	}, 100);
};
