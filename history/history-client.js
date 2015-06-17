/* global window, document, history, location */

"use strict";

var format = require("../lib/format.js"),
	url = require("../lib/url.js");

module.exports = function(core, config, store) {
	core.on("boot", function(state) {
		url.parse(location.href, state);

		state.context.env = state.context.env || "web";
	}, 900);

	core.on("statechange", function(changes) {
		var mode = store.get("nav", "mode"),
			room = store.get("nav", "room"),
			thread = store.get("nav", "thread"),
			title, path;

		if (/^(chat|room)$/.test(mode) && ((room && room.indexOf(":") > -1) || !room)) {
			// Not ready with the new room yet
			return;
		}

		switch (mode) {
		case "room":
			title = format.titleCase(room) + " on Scrollback";
			break;
		case "chat":
			title = thread ? (store.get("indexes", "threadsById", thread) || { title: room }).title : "All messages";
			break;
		default:
			title = "Scrollback";
		}

		document.title = title;

		path = url.build(store.get(), store);

		if (path === location.pathname) {
			return;
		}

		if (changes.nav && (changes.nav.mode || changes.nav.dialog || changes.nav.view)) {
			history.pushState(store.get("nav"), null, path);
		} else {
			history.replaceState(store.get("nav"), null, path);
		}

	}, 100);

	window.addEventListener("popstate", function(event) {
		core.emit("setstate", { nav: event.state });
	});
};
