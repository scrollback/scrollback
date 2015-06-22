/* global window, document, history, location */

"use strict";

var url = require("../lib/url.js"),
	oldPath;

module.exports = function(core, config, store) {
	core.on("boot", function(state) {
		url.parse(location.href, state);

		state.context = (state.context && typeof state.context === "object") ? state.context : {};
		state.context.env = state.context.env || "web";
	}, 900);

	core.on("statechange", function(changes) {
		var mode = store.get("nav", "mode"),
			room = store.get("nav", "room"),
			path;

		if (/^(chat|room)$/.test(mode) && ((room && room.indexOf(":") > -1) || !room)) {
			// not ready with the new room yet
			return;
		}

		document.title = store.getPageTitle();

		path = url.build(store.get(), store);

		if (path === oldPath) {
			return;
		}

		if (changes.nav && (changes.nav.mode || changes.nav.dialog || changes.nav.view)) {
			history.pushState(store.get("nav"), null, path);
		} else {
			history.replaceState(store.get("nav"), null, path);
		}

		oldPath = path;

	}, 100);

	window.addEventListener("popstate", function(event) {
		core.emit("setstate", { nav: event.state });
	});
};
