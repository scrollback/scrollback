/* global window, document, history, location */

"use strict";

var objUtils = require("../lib/obj-utils.js"),
	format = require("../lib/format.js");

function getParams(string) {
	var params = {};
	string.split("&").forEach(function(kv) {
		kv = kv.split("=");

		if (kv[0]) {
			params[kv[0]] = kv.length > 1 ? decodeURIComponent(kv[1]) : true;
		}
	});

	return params;
}

var propMap = {
	nav: {
		dialog: "d",
		dialogState: "ds",
		view: "v"
	}
};

module.exports = function(core, config, store) {
	core.on("boot", function(state, next) {
		var params = getParams(location.search.substr(1).toLowerCase()),
			path = location.pathname.substr(1).toLowerCase().split("/");

		state.nav = state.nav || {};
		state.context = state.context || {};

		if (path.length === 0 || path[0] === "me") {
			state.nav.mode = "home";
		} else if (path.length === 1) {
			state.nav.mode = "room";
			state.nav.room = path[0];
			state.nav.threadRange = { time: parseFloat(params.t) || null, before: 20 };
		} else if (path.length === 2 || path.length === 3) {
			state.nav.mode = "chat";
			state.nav.room = path[0];

			if (path[1] !== "all") {
				state.nav.thread = path[1];
			}

			state.nav.textRange = { time: parseFloat(params.t) || null };
			state.nav.textRange[params.t ? "after" : "before"] = 30;
		} else {
			state.nav.mode = "home";
		}

		if (params.embed) {
			state.context.env = "embed";

			try {
				state.context.embed = JSON.parse(params.embed);
			} catch (e) {
				console.error("JSON parse of embed param failed", e);
				state.context.embed = {};
			}
		}

		state.context.env = state.context.env || "web";

		for (var section in propMap) {
			for (var prop in propMap[section]) {
				if (params[propMap[section][prop]]) {
					try {
						if (prop === "dialogState") {
							params[propMap[section][prop]] = decodeURIComponent(JSON.parse(state[section][prop]));
						} else {
							state[section][prop] = params[propMap[section][prop]];
						}
					} catch (e) {
						state[section][prop] = {};
					}

				}
			}
		}
		next();
	}, 900);

	core.on("statechange", function(changes, next) {
		var url, params = {}, paramstr = [],
			state = { nav: store.get("nav"), context: store.get("context") },
			title;

		if (state.nav.mode === "home") {
			url = "/me";
		} else if (state.nav.mode === "room") {
			if (state.nav.room.indexOf(":") !== -1) {
				return next(); // Not ready with the new room yet.
			}

			url = "/" + state.nav.room;
			title = format.titleCase(state.nav.room) + " on Scrollback";
		} else if (state.nav.mode === "chat") {
			if (state.nav.room.indexOf(":") !== -1) {
				return next(); // Not ready with the new room yet.
			}

			title = state.nav.thread ? (store.get("indexes", "threadsById", state.nav.thread) || { title: state.nav.room }).title : "All messages";
			url = "/" + state.nav.room + "/" + (state.nav.thread ? state.nav.thread : "all") + (title ? "/" + format.urlComponent(title) : "");
		}

		document.title = title || "Scrollback";

		if (state.nav.mode === "room" && state.nav.threadRange.time) {
			params.t = state.nav.threadRange.time;
		}

		if (state.nav.mode === "chat" && state.nav.textRange.time) {
			params.t = state.nav.textRange.time;
		}

		if (state.context.embed) {
			params.embed = JSON.stringify(state.context.embed);
		}

		for (var section in propMap) {
			for (var prop in propMap[section]) {
				if (state[section][prop]) {
					if (typeof state[section][prop] === "object") {
						params[propMap[section][prop]] = encodeURIComponent(JSON.stringify(state[section][prop]));
					} else {
						params[propMap[section][prop]] = state[section][prop];
					}
				}
			}
		}

		if (url === location.pathname && objUtils.equal(params, getParams(location.search.substr(1)))) {
			return next();
		}

		for (var key in params) {
			paramstr.push(
				encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
			);
		}

		if (paramstr.length) {
			url = url + "?" + paramstr.join("&");
		}

		if (changes.nav && ("mode" in changes.nav || "dialog" in changes.nav || "view" in changes.nav)) {
			history.pushState(state.nav, null, url);
		} else {
			history.replaceState(state.nav, null, url);
		}
		next();

	}, 100);

	window.addEventListener("popstate", function(event) {
		core.emit("setstate", { nav: event.state });
	});
};
