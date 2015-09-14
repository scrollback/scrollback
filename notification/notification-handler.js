/* eslint-env browser */

"use strict";

const userUtils = require("../lib/user-utils.js");

module.exports = (core, config, store) => {
	// Load cached notifications if guest
	function loadCache() {
		let userId = store.get("user");

		if (userUtils.isGuest(userId)) {
			let stored;

			try {
				stored = JSON.parse(window.localStorage.getItem("notes"));
			} catch (e) {
				console.log("Failed to parse cached notes", e);
			}

			if (stored && Array.isArray(stored.notes)) {
				core.emit("setstate", { notes: stored.notes });
			}
		}
	}

	core.on("init-dn", () => {

		loadCache();

		if (!userUtils.isGuest(store.get("user"))) {
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

		if (userUtils.isGuest(userId) && changes.notes) {
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

				if (note.group === roomId + "/" + (threadId || "all")) {
					return;
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
