/* jshint browser: true */
/* global $, window*/
/* exported currentState */

var currentState = window.currentState,
	libsb;

module.exports = function(l) {
	libsb = l;
	// On navigation, add history and change URLs and title
	libsb.on("navigate", updateHistory, 200);
	// On history change, load the appropriate state
	$(window).on("popstate", function() {
		if (!currentState || currentState.embed) {
			return;
		}

		if (("state" in history && history.state !== null)) {
			var state = {},
				prop;

			for (prop in history.state) {
				if (history.state.hasOwnProperty(prop)) {
					if (prop !== "old" && prop !== "changes") {
						state[prop] = history.state[prop];
					}
				}
			}
			if (currentState.connectionStatus) state.connectionStatus = currentState.connectionStatus;
			else state.connectionStatus = "connecting";
			state.source = "history";
			libsb.emit("navigate", state);
		}
	});
};

function updateTitle(state) {
	switch (state.mode) {
		case "conf":
			document.title = (currentState.tab ? (currentState.tab.charAt(0).toUpperCase() + currentState.tab.slice(1)) : "Room") + " settings" + (currentState.roomName ? (" - " + currentState.roomName) : "");
			break;
		case "pref":
			document.title = "Account settings - " + (libsb.user ? libsb.user.id : "Scrollback");
			break;
		case "search":
			document.title = "Results for " + state.query + " - Scrollback";
			break;
		case "home":
			document.title = "My rooms on Scrollback";
			break;
		default:
			document.title = state.roomName ? state.roomName + " on Scrollback" : "Scrollback.io";
	}
}

function buildUrl(state) {
	var path, params = [];
	switch (state.mode) {
		case 'conf':
			path = '/' + (state.roomName ? state.roomName + '/edit' : 'me');
			break;
		case 'pref':
			path = '/me/edit';
			break;
		case 'search':
			path = state.roomName ? '/' + state.roomName : '';
			params.push('q=' + encodeURIComponent(state.query));
			break;
		case "home":
			path = "/me";
			break;
		default:
			path = (state.roomName ? '/' + state.roomName + (
				state.thread ? '/' + state.thread : "" /*+ '/' + format.sanitize(state.thread): ''*/ ) : '');
	}

	if (state.time) {
		params.push("time=" + new Date(state.time).toISOString());
	}

	if (state.embed) {
		params.push("embed=" + encodeURIComponent(JSON.stringify(state.embed)));
	}

	[ "tab", "dialog", "platform", "webview" ].forEach(function(query) {
		if (query in state && state[query] !== null && typeof state[query] !== "undefined") {
			params.push(query + "=" + encodeURIComponent(state[query]));
		}
	});

	return path + (params.length ? "?" + params.join("&") : "");
}

function pushState(state) {
	var url, oldUrl = location.pathname + location.search,
		pushableState, fun = "pushState";
	if (!state || typeof state !== "object") return;
	pushableState = $.extend({}, state, true);
	url = buildUrl(pushableState);
	if (oldUrl !== url) {
		if (["boot", "socket"].indexOf(pushableState.source) >= 0 || (Object.keys(state.changes)).length === 1 && state.changes.time) fun = "replaceState";
	} else if (!state.changes.view) {
		return;
	}

	delete pushableState.old;
	delete pushableState.changes;
	delete pushableState.connectionStatus;
	history[fun](pushableState, null, url);
}

function updateHistory(state, next) {
	if (currentState.embed) return next();
	updateTitle(state);
	if (state.source == "history") return next();
	pushState(state);
	next();
}
