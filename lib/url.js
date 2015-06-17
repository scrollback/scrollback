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
	parse: function() {
		// TODO
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
