/* jshint browser: true */
/* global $, libsb */
/* exported currentState */


/**
 * Properties of naviagtion state object
 *
 * room: {String} roomId
 * embed: {String} (toast|full)
 * minimize: {Boolean} (true|false)
 * theme: {String} (dark|light)
 * view: {String} (normal|rooms|meta|signup)
 * mode: {String} (normal|search|conf|pref|home)
 * tab: {String} (info|people|threads|local|global)
 * thread: {String} threadId
 * query: {String} searchQuery
 * text: {String} textId
 * time: {String} - Timestamp of chat message
 * old: {Object} - Old state object
 * changes: {Object} - New values of changed properties
 */

var currentState = window.currentState = {};

libsb.on("navigate", function(state, next) {
	state.old = $.extend(true, {}, currentState); // copying object by value
	state.changes = {};

	["roomName", "room", "view", "theme", "embed", "minimize", "mode", "tab", "thread", "query", "text", "time"].forEach(function(prop) {
		if (typeof state[prop] === "undefined") {
			if (typeof state.old[prop] !== "undefined") {
				currentState[prop] = state[prop] = state.old[prop];
			}
			return;
		}

		if (state[prop] != state.old[prop]) {
			if(state[prop] === null) {
				delete state[prop];
				delete currentState[prop];
				state.changes[prop] = null;
			} else {
				currentState[prop] = state.changes[prop] = state[prop];
			}
		} else {
			currentState[prop] = state[prop];
		}
	});

	next();
}, 1000);

// On navigation, set the body classes.
libsb.on("navigate", function(state, next) {
	if (!state.time && !state.roomName && !state.thread) {
		if(!state.time && state.old.time) {
			state.time = state.old.time;
		}
	}

	if (state.old && state.theme !== state.old.theme) {
		$("body").removeClass("theme-" + state.old.theme);

		if (state.theme) {
			$("body").addClass("theme-" + state.theme);
		}
	}

	if (state.old && state.embed !== state.old.embed) {
		$("body").removeClass("embed embed-" + state.old.theme);

		if (state.embed) {
			$("body").addClass("embed embed-" + state.embed);
		}
	}

	if (state.old && state.minimize !== state.old.minimize) {
		if (state.minimize && state.embed === "toast") {
			$("body").addClass("minimized");
		} else {
			$("body").removeClass("minimized");
		}
	}

	if (state.old && state.mode !== state.old.mode) {
		$("body").removeClass("mode-" + state.old.mode);

		if (state.mode) {
			$("body").addClass("mode-" + state.mode);
		}
	}

	if (state.old && state.view !== state.old.view) {
		$("body").removeClass("view-" + state.old.view);

		if (state.view) {
			$("body").addClass("view-" + state.view);
		}
	}

	if (state.old && state.tab !== state.old.tab) {
		if (state.tab) {
			$(".tab.current").removeClass("current");
			$(".tab-" + state.tab).addClass("current");
		}
	}

	next();
}, 999);

// On navigation, add history and change URLs and title
libsb.on("navigate", function(state, next) {
	if (state.source == "history"){
		return;
	}
	function buildurl() {
		var path, params = [];

		switch(state.mode) {
			case 'conf':
				path = '/' + (state.roomName ? state.roomName + '/edit': 'me');
				document.title = "Room settings - " + state.roomName;
				break;
			case 'pref':
				path = '/me/edit';
				document.title = "Account settings - " + libsb.user.id;
				break;
			case 'search':
				path = state.roomName ? '/' + state.roomName: '';
				document.title = "Results for " + state.query;
				params.push('q=' + encodeURIComponent(state.query));
				break;
			case "home":
				path = "/me";
				document.title = state.user.id;
				break;
			default:
				path = (state.roomName ? '/' + state.roomName + (
						state.thread ? '/' + state.thread: "" /*+ '/' + format.sanitize(state.thread): ''*/
					   ): '');
				document.title = state.roomName ? state.roomName + " on scrollback" : "Scrollback.io";
		}

		if (state.time) {
			params.push("time=" + new Date(state.time).toISOString());
		}

		if (state.tab) {
			params.push("tab=" + state.tab);
		}

		if (state.embed) {
			params.push("embed=" + state.embed);
		}

		if (state.embed === "toast" && state.minimize) {
			params.push("minimize=true");
		}

		if (state.theme && state.theme !== "light") {
			params.push("theme=" + state.theme);
		}

		return path + (params.length ? "?" + params.join("&"): "");
	}

	function pushState() {
		var url = buildurl();
        /*state.old && delete state.old;
        state.changes && delete state.changes;*/
		if (Object.keys(state.changes).length === "") {
			state.view = "normal";
		}

		if (state.source == "init" || state.source == "text-area") {
            history.replaceState(state, null, url);
			return;
		}

		if ((state.changes.view == "rooms" || state.changes.view == "meta" || state.changes.view =="normal") && Object.keys(state.changes).length == 1) {
			history.pushState(state, null, url);
			return;
		} else if (Object.keys(state.changes).length === 0) {
			history.pushState(state, null, url);
			return;
		}

		if (url && history.pushState && url != location.pathname + location.search && state.source !== "history") {
			if (state.changes.time && Object.keys(state.changes).length == 1) {
				history.replaceState(state, null, url);
			} else {
				history.pushState(state, null, url);
			}
		}
	}

	pushState();

	next();
}, 200);

// On history change, load the appropriate state
$(window).on("popstate", function() {

	if (("state" in history && history.state !== null)) {
		var state = {},
			prop;

		for (prop in history.state) {
			if (history.state.hasOwnProperty(prop)) {
				if(prop !== "old" && prop !== "changes") {
					state[prop] = history.state[prop];
				}
			}
		}

		state.source = "history";
		libsb.emit("navigate", state);
	}
});
