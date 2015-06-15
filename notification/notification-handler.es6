/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const user = require("../lib/user.js")(core, config, store);

	// Load cached notifications if guest
	function loadCache() {
		let userId = store.get("user");

		if (user.isGuest(userId)) {
			let notes;

			try {
				notes = JSON.parse(window.localStorage.getItem("notes"))[userId];
			} catch (e) {
				console.log("Failed to load cached notes", e);
			}

			if (Array.isArray(notes)) {
				core.emit("setstate", { notes });
			}
		}
	}

	core.on("init-dn", () => {

		loadCache();

		if (!user.isGuest(store.get("user"))) {
			// Delete cached notes if not guest
			try {
				window.localStorage.deleteItem("notes");
			} catch (e) {
				console.log("Failed to clear cached notes", e);
			}

			core.emit("getNotes", {}, (err, res) => {
				let notes;

				if (err) {
					notes = [];
				} else {
					notes = res.results;
				}

				if (Array.isArray(notes)) {
					core.emit("setstate", { notes });
				}
			});
		}
	}, 100);

	window.addEventListener("storage", loadCache, false);

	// Update notifications cache if guest
	core.on("statechange", changes => {
		let userId = store.get("user");

		if (user.isGuest(userId) && changes.notes) {
			let notes = { [userId]: store.get("notes") };

			try {
				localStorage.setItem("notes", JSON.stringify(notes));
			} catch (e) {
				console.log("Failed to cache notes", e);
			}
		}
	}, 100);

	let actions = [ "note-dn", "note-up" ];

	actions.forEach(action => {
		core.on(action, note => {
			let notes = store.get("notes").slice(0);

			notes.push(note);

			core.emit("setstate", { notes });
		}, 10);
	});

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
