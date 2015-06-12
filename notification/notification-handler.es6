/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const user = require("../lib/user.js")(core, config, store);

	core.on("init-dn", () => {

		if (!user.isGuest(store.get("user"))) {
			// Delete cached notifications if not guest
			try {
				window.localStorage.deleteItem("notes");
			} catch (e) {
				console.log("Failed to clear cached notes", e);
			}
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
	}, 100);

	let actions = [ "note-dn", "note-up" ];

	actions.forEach(action => {
		core.on(action, note => {
			let notes = store.get("notes").slice(0),
				count = 0,
				max = 3;

			// Handle groups
			for (let n of notes) {
				if (n && n.group + "_" + n.noteType === note.group + "_" + note.noteType) {
					count += typeof n.count === "number" ? n.count : 1;
				}
			}

			// Remove grouped notifications
			if (count > max) {
				for (let i = notes.length - 1; i >= 0; i--) {
					if (notes[i] && notes[i].group + "_" + notes[i].noteType === note.group + "_" + note.noteType) {
						notes.splice(i, 1);
					}
				}
			}

			// We are adding another note, so add 1
			note.count = count + 1;

			notes.push(note);

			core.emit("setstate", { notes });
		}, 10);
	});

	core.on("setstate", changes => {
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

	// Load cached notifications if guest
	[ "load", "storage" ].forEach(event => {
		window.addEventListener(event, () => {
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
		});
	});

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
};
