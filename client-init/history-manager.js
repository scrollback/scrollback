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
			if(currentState.connectionStatus) state.connectionStatus = currentState.connectionStatus;
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

	if (state.tab) {
		params.push("tab=" + state.tab);
	}

	if (state.embed) {
		params.push("embed=" + encodeURIComponent(JSON.stringify(state.embed)));
	}
	return path + (params.length ? "?" + params.join("&") : "");
}

function pushState(state) {
	var url, pushableState;
	if(!state || typeof state !== "object") return;
	
	url = state.phonegap ? null : buildUrl(state);
	pushableState = $.extend({}. state, true);
	
	if (pushableState.source == "init" || pushableState.source == "chat-area") {
		history.replaceState(pushableState, null, url);
		return;
	}

	if (pushableState.changes && (pushableState.changes.view == "rooms" || pushableState.changes.view == "meta" || pushableState.changes.view == "normal") && Object.keys(pushableState.changes).length == 1) {
		history.pushState(pushableState, null, url);
		return;
	} else if (Object.keys(state.changes).length === 0) {
		history.pushState(pushableState, null, url);
		return;
	}
	
	delete pushableState.old;
	delete pushableState.changes;
	
	if (url && history.pushState && url != location.pathname + location.search && pushableState.source !== "history") {
		if (state.changes && state.changes.time && Object.keys(state.changes).length == 1) {
			history.replaceState(pushableState, null, url);
		} else {
			history.pushState(pushableState, null, url);
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
