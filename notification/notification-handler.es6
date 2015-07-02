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
				window.localStorage.removeItem("notes");
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
			let roomId = store.get("nav", "room"),
				mode = store.get("nav", "mode");

			// TODO: figure out a better way
			if (mode === "chat") {
				let threadId = store.get("nav", "thread");

				if (threadId) {
					if (note.group === roomId + "/" + (threadId || "all")) {
						return;
					}
				} else {
					if (note.group === roomId) {
						return;
					}
				}
			} else if (mode === "room") {
				if (note.group === roomId) {
					return;
				}
			}

			let notes = store.get("notes").slice(0);

			notes.push(note);

			core.emit("setstate", { notes });
		}, 10);
	});
};
