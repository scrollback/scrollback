/* jshint browser: true */
/* global $, window*/
/* exported currentState */
var urlUtils = require("../lib/url-utils.js");

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

function pushState(state) {
	var url, oldUrl = location.pathname + location.search,
		pushableState, fun = "pushState";
	if (!state || typeof state !== "object") return;
	pushableState = $.extend({}, state, true);
	url = urlUtils.build(pushableState);
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
