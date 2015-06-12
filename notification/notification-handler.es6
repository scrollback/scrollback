/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	core.on("init-dn", () => {
		core.emit("getNotes", {}, (err, res) => core.emit("setstate", { notes: res.results }));
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
};
