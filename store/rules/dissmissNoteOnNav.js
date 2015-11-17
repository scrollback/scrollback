"use strict";

module.exports = (core, config, store) => {
	core.on("setstate", changes => {
		if (changes.nav.mode || changes.nav.room || "thread" in changes.nav) {
			const future = store.with(changes);
			const roomId = future.get("nav", "room");
			const mode = future.get("nav", "mode");

			if (mode === "chat") {
				const threadId = future.get("nav", "thread");

				if (threadId) {
					core.emit("note-up", {
						group: roomId + "/" + threadId,
						dismissTime: Date.now()
					});

					core.emit("note-up", {
						noteType: "thread",
						ref: threadId,
						dismissTime: Date.now()
					});
				} else {
					core.emit("note-up", {
						group: roomId + "/all",
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
