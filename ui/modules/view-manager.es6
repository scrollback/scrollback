/* eslint-env browser */

"use strict";

const keys = [ "view", "mode" ],
	  types = [
				"view", "mode", "role", "permission",
				"embed", "toast", "canvas",
				"color", "input", "state"
			];

module.exports = (core, config, store) => {
	const user = require("../../lib/user.js")(core, config, store),
		  room = require("../../lib/room.js")(core, config, store);

	let oldClassName;

	// Listen to navigate and add class names
	core.on("statechange", () => {
		let newClassList = [],
			currentClassName, newClassName;

		const nav = store.get("nav");

		for (var i = 0, l = keys.length; i < l; i++) {
			let value = nav[keys[i]];

			if (value) {
				newClassList.push(keys[i] + "-" + value);
			}
		}

		if (nav.mode === "chat" && nav.thread) {
			const thread = store.get("indexes", "threadsById", nav.thread);

			if (thread && thread.color) {
				newClassList.push("color-" + thread.color);
			}
		}

		newClassList.push("role-" + user.getRole());

		if (room.isWritable()) {
			newClassList.push("permission-write");
		} else if (room.isReadable()) {
			newClassList.push("permission-read");
		}

		if (store.get("context", "env") === "embed") {
			const form = store.get("context", "embed", "form");

			if (form) {
				newClassList.push("embed-" + form);
			}

			const minimize = store.get("context", "embed", "minimize");

			if (minimize) {
				newClassList.push(form + "-minimized");
			}
		}

		if (store.getRoom() === "missing") {
			newClassList.push("invalid-room");
		}

		if (store.get("app", "focusedInput")) {
			newClassList.push("input-focused");
		}

		newClassList.push("state-" + store.get("app", "connectionStatus"));

		// Sort and join class names for comparison
		newClassName = newClassList.sort().join(" ");

		// Compare with old class name
		if (oldClassName !== newClassName) {
			currentClassName = document.body.className;

			for (var j = 0, k = types.length; j < k; j++) {
				currentClassName = currentClassName.replace(new RegExp("\\b" + types[j] + "-" + "\\S+", "g"), "").trim();
			}

			document.body.className = newClassName + " " + currentClassName;

			// Store the old class name
			oldClassName = newClassName;
		}
	}, 10);
};
