"use strict";

var format = require("../lib/format.js"),
	propMap = {
		nav: {
			dialog: "d",
			dialogState: "ds",
			view: "v"
		}
	};

module.exports = {
	parse: function(url, state) {
		var params = {},
			parts, path, search;

		if (typeof url !== "string") {
			throw new TypeError("ERR_INVALID_TYPE");
		}

		if (typeof state === "object" && state) {
			state.nav = (typeof state.nav === "object" && state.nav) ? state.nav : {};
			state.context = (typeof state.context === "object" && state.context) ? state.context : {};
		} else {
			state = {
				nav: {},
				context: {}
			};
		}

		// strip out the host and protocol from the URL
		url = url.replace(/^([a-z]+\:)?\/\/[^\/]+/, "");

		parts = url.split("?");
		path = parts[0];
		search = parts[1];

		if (search) {
			search.split("&").forEach(function(kv) {
				var pair = kv.split("=");

				if (pair[0]) {
					params[pair[0]] = pair.length > 1 ? decodeURIComponent(pair[1]) : true;
				}
			});
		}

		path = (/^\//.test(path) ? path.substr(1) : path).split("/");

		if (path.length === 0 || path[0] === "" || path[0] === "me") {
			state.nav.mode = "home";
		} else if (path.length >= 1) {
			state.nav.room = path[0].toLowerCase();

			if (path.length === 1) {
				state.nav.mode = "room";
				state.nav.threadRange = { time: parseFloat(params.t) || null, before: 20 };
			} else {
				state.nav.mode = "chat";

				if (path[1] && path[1] !== "all") {
					state.nav.thread = path[1];
				} else {
					state.nav.thread = null;
				}

				state.nav.textRange = { time: parseFloat(params.t) || null };
				state.nav.textRange[params.t ? "after" : "before"] = 30;
			}
		}

		if (params.embed) {
			state.context.env = "embed";

			try {
				state.context.embed = JSON.parse(params.embed);
			} catch (e) {
				state.context.embed = {};
			}
		}

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

		return state;
	},

	build: function(state, store) {
		var params = {},
			queries = [],
			url, title;

		if (typeof state !== "object" || state === null || typeof state.nav !== "object" || state.nav === null) {
			throw new Error("ERR_INVALID_STATE");
		}

		switch (state.nav.mode) {
		case "home":
			url = "/me";
			break;
		case "room":
			if (state.nav.threadRange && state.nav.threadRange.time) {
				params.t = state.nav.threadRange.time;
			}

			url = "/" + state.nav.room;
			break;
		case "chat":
			if (state.nav.textRange && state.nav.textRange.time) {
				params.t = state.nav.textRange.time;
			}

			if (state.nav.thread && store) {
				title = (store.get("indexes", "threadsById", state.nav.thread) || {}).title;
			}

			url = "/" + state.nav.room + "/" + (state.nav.thread ? state.nav.thread : "all") + (title ? "/" + format.urlComponent(title) : "");
			break;
		default:
			url = "/";
		}

		if (state.context && state.context.embed) {
			params.embed = JSON.stringify(state.context.embed);
		}

		for (var section in propMap) {
			if (state[section]) {
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
		}

		for (var key in params) {
			queries.push(
				encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
			);
		}

		if (queries.length) {
			url += "?" + queries.join("&");
		}

		return url;
	}
};
