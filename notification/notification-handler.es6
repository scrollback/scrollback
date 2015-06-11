/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	core.on("init-dn", () => {
		core.emit("getNotes", {}, (err, res) => core.emit("setstate", { notes: res.results }));
	}, 100);

	core.on("note-dn", note => {
		let notes = store.get("notes");

		notes.push(note);

		core.emit("setstate", { notes });
	}, 100);

	core.on("note-up", note => {
		let notes = store.get("notes");

		notes.push(note);

		core.emit("setstate", { notes });
	}, 100);
};
