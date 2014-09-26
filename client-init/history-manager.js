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

			state.source = "history";
			libsb.emit("navigate", state);
		}
	});
};

function updateTitle(state) {
	switch (state.mode) {
	case "conf":
		document.title = (currentState.tab ? (currentState.tab.charAt(0).toUpperCase() + currentState.tab.slice(1)) : "Room") + " settings" + (currentState.roomName ? ( " - "  + currentState.roomName) : "");
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

	if (state.tab) {
		params.push("tab=" + state.tab);
	}

	if (state.embed) {
		params.push("embed=" + encodeURIComponent(JSON.stringify(state.embed)));
	}
	return path + (params.length ? "?" + params.join("&") : "");
}

function pushState(state) {
	var url = state.phonegap ? null : buildUrl(state);

	/*state.old && delete state.old;
        state.changes && delete state.changes;*/
	if (Object.keys(state.changes).length === "") {
		state.view = "normal";
	}

	if (state.source == "init" || state.source == "chat-area") {
		history.replaceState(state, null, url);
		return;
	}

	if ((state.changes.view == "rooms" || state.changes.view == "meta" || state.changes.view == "normal") && Object.keys(state.changes).length == 1) {
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

function updateHistory(state, next) {
	if (currentState.embed) {
		return next();
	}

	updateTitle(state);

	if (state.source == "history") {
		return next();
	}

	pushState(state);
	next();
}
