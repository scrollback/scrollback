"use strict";

var juri = require("juri")();

/*
	Avoid adding any more dependencies.
	This library is used by embed-parent scripts that are included on third-party pages.
*/


/*
	GET parameters:

	d: nav.dialog
	e: context.embed
	g: nav.dialogState
	i: context.init (nick, jws, createRoom, createUser)
	o: context.origin
	t: nav.threadRange.time or nav.textRange.time
	v: nav.view
*/

module.exports = {
	parse: function(url, state) {
		var params = {}, parts, path;

		if (typeof url !== "string") {
			throw new TypeError("ERR_INVALID_TYPE");
		}

		state = state || {};
		state.nav = state.nav || {};

		// strip out the host and protocol from the URL, and split it into parts
		url = url.replace(/^([a-z]+\:)?\/\/[^\/]+/, "");

		parts = url.split("?");
		path = parts[0];

		if (parts[1]) { params = juri.decodeQString(parts[1]); }

		path = (/^\//.test(path) ? path.substr(1) : path).split("/");

		// process path and time
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

		// process query params
		if (params.e || params.o || params.i) { state.context = state.context || {}; }
		if (params.e) { state.context.embed  = params.e; state.context.env = "embed"; }
		if (params.o) { state.context.origin = params.o; }
		if (params.i) { state.context.init   = params.i; }

		if (params.d || params.v || params.g) { state.nav = state.nav || {}; }
		if (params.d)  { state.nav.dialog      = params.d; }
		if (params.g)  { state.nav.dialogState = params.g; }
		if (params.v)  { state.nav.view        = params.v; }

		return state;
	},

	build: function(state, store) {
		var params = {}, path, title;

		if (typeof state !== "object" || state === null || typeof state.nav !== "object" || state.nav === null) {
			throw new Error("ERR_INVALID_STATE");
		}

		switch (state.nav.mode) {
		case "home":
			path = "/me";
			break;
		case "room":
			if (state.nav.threadRange && state.nav.threadRange.time) {
				params.t = state.nav.threadRange.time;
			}

			path = "/" + state.nav.room;
			break;
		case "chat":
			if (state.nav.textRange && state.nav.textRange.time) {
				params.t = state.nav.textRange.time;
			}

			if (state.nav.thread && store) {
				title = (store.get("indexes", "threadsById", state.nav.thread) || {}).title;
			}

			path = "/" + state.nav.room + "/" + (state.nav.thread ? state.nav.thread : "all") + (title ? "/" + title.toLowerCase().trim().replace(/['"]/g, "").replace(/\W+/g, "-") : "");
			break;
		default:
			path = "/";
		}

		if (state.context && state.context.env !== "web") {
			if (state.context.embed)  params.e = state.context.embed;
			if (state.context.origin) params.o = state.context.origin;
			if (state.context.init)   params.i = state.context.init;
		}

		if (state.nav) {
			if (state.nav.dialog) {
				params.d = state.nav.dialog;
				if (state.nav.dialogState) { params.g = state.nav.dialogState; }
			}

			if (state.nav.view) { params.v = state.nav.view; }
		}

		if (Object.keys(params).length) {
			path = path + "?" + juri.encodeQString(params);
		}

		return path;
	}
};
