/* jshint browser: true */
/* jshint jquery: true */
/* global libsb, format */

/*
	Properties of the navigation state object:

	room: "roomid",
	view: (normal|rooms|meta)
	mode: (normal|search|conf|prefs|home),
	tab: (info|people|threads|local|global|<conf/pref tabs>),
	thread: "selected_thread",
	query; "search_query",
	text: "selected text id",
	time: "current scroll time"

	old: {old state object},
	changes: {new values of changed properties only}

*/

(function() {
	var current = {};

	libsb.on("navigate", function(state, next) {
		state.old = current;
		current = {};

		["room", "view", "mode", "tab", "thread", "query", "text", "time"].forEach(function(prop) {
			if(typeof state[prop] === "undefined") {
				if(typeof state.old[prop] !== "undefined")
					current[prop] = state[prop] = state.old[prop];
				return;
			}

			if(state[prop] != state.old[prop]) {
				if(state[prop] === null) delete state[prop];
				current[prop] = state[prop];
			}
		});

		next();

	}, 10);
}());

libsb.on("navigate", function(state, next) {
	if(state.mode !== state.old.mode) {
		$(document.body).removeClass(state.old.mode + "-mode");
		$(document.body).addClass(state.mode + "-mode");
	}

	if(state.view !== state.old.view) {
		$(document.body).removeClass(state.old.view + "-view");
		$(document.body).addClass(state.view + "-view");
	}

	if(state.tab !== state.old.tab) {
		$(".tab" + state.old.tab + ", .pane-" + state.old.tab).removeClass("current");
		$(".tab-" + state.tab + ", .pane-" + state.tab).addClass("current");
	}

	next();
});

libsb.on("navigate", function(state, next) {
//		libsb.getThreads(state.thread, function (err, thread) {
//			thread.title;
//		});

	function buildurl() {
		var url, room, thread, time, mode, query;

		if (state.room !== undefined) {
			room = "/" + state.room;
		} else {
			room = "/me";
		}

		if (state.thread !== undefined) {
			thread = "/" + state.thread;
		} else {
			thread = "";
		}

		if (state.time !== undefined && state.time !== null) {
			time = "?time=" + new Date(state.time).toISOString();
		} else {
			time = "";
		}

		if (state.tab === "global") {
			room = "";
		}

		if (state.mode === "conf") {
			mode = "/edit";
		} if (state.mode === "search") {
			mode = "/search";
		} else {
			mode = "";
		}

		if (state.query !== undefined) {
			query = "?q=" + encodeURIComponent(state.query);
		} else {
			query = "";
		}

		url = room + thread + time + mode + query;

//		if (state.room !== undefined) {
//			if (state.room !== state.old.room) {
//				url = "/" + state.room;
//			}
//
//			if (state.thread !== state.old.thread) {
//				if (state.thread === undefined) {
//					// room is present, thread is blank: scrollback.io/roomname
//					url = "/" + state.room;
//				} else {
//					// room & thread both are present: scrollback.io/roomname/threadid/format.sanitize(thread-title)
//					// TODO
//					url = "/" + state.room + "/" + state.thread;
//				}
//			}
//
//			if (state.time !== state.old.time && state.time !== undefined && state.time !== null) {
//				// scrolled to a particular time: ...?time=<timestamp> new Date(state.time).toISOString()
//				if (state.thread === undefined) {
//					url = "/" + state.room + "?time=" + new Date(state.time).toISOString();
//				} else {
//					url = "/" + state.room + "/" + state.thread + "?time=" + new Date(state.time).toISOString();
//				}
//			}
//		} else {
//			// room is blank: scrollback.io/me
//			url = "/me";
//		}
//
//		if (state.mode !== state.old.mode || state.tab !== state.old.tab) {
//			if (state.mode === "conf" && state.room !== undefined) {
//				// mode is conf: scrollback.io/roomname/edit
//				url = "/" + state.room + "/edit";
//			} else if (state.mode === "search") {
//				if (state.tab === "local" && state.room !== undefined) {
//					// mode is search (local): scrollback.io/roomname/search?q=encodeURIComponent(state.query)
//					url = "/" + state.room + "/search?q=" + encodeURIComponent(state.query);
//				} else if (state.tab === "global") {
//					// mode is search (global): scrollback.io/search?q=encodeURIComponent(state.query)
//					url = "/search?q=" + encodeURIComponent(state.query);
//				}
//			}
//		}

		return url;
	}

	if (state.source !== "history") {
		var url = buildurl();

		if (history.pushState) {
			if (url) {
				history.pushState(state, null, url);
			} else {
				history.pushState(state, null, null);
			}
		} else {
			window.location.href = window.location.host + url;
		}
	}

	next();
});

$(window).on("popstate", function() {
	var state = { }, prop;

	for (prop in history.state) {
		if (history.state.hasOwnProperty(prop)) {
			state[prop] = history.state[prop];
		}
	}

	state.source = "history";

	libsb.emit("navigate", state);
});
