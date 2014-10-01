/* jshint browser: true */
/* global $, window*/
/* exported currentState */

var currentState = window.currentState = {},
	props = [
		"roomName", "room", "view", "theme", "embed", "minimize",
		"mode", "tab", "thread", "query", "text", "time",
		"roomStatus", "connectionStatus", "phonegap"
	],
	libsb; // think of a way to remove this from window.(if need)

module.exports = function(l) {
	libsb = l;

	libsb.on("navigate", loadOld, 999);
	libsb.on("navigate", saveCurrentState, 700);
	libsb.on("navigate", setDefaults, 600);

	libsb.on('room-dn', function(room, next) {
		if (room.room.id === currentState.roomName) {
			currentState.room = room.room;
		}

		next();
	}, 100);
};

function setDefaults(state, next) {
	state.time = state.query ? null : state.time;
	state.mode = state.mode || (state.query ? "search" : state.roomName ? "normal" : "home");
	state.tab = state.tab || "people";

	return next();
}

function loadOld(state, next) {
	// load the "old" property and the "changes" property.
	state.old = $.extend(true, {}, currentState); // copying object by value
	state.changes = {};

    props.forEach(function(prop) {
		if (typeof state[prop] === "undefined") {
			if (typeof state.old[prop] !== "undefined") {
				state[prop] = state.old[prop];
			}
			return;
		}
		if (state[prop] != state.old[prop]) {
			state.changes[prop] = state[prop];
		}
	});

	return next();
}

function saveCurrentState(state, next) {
    props.forEach(function(prop) {
		if (typeof state[prop] === "undefined") {
			if (typeof state.old[prop] !== "undefined") {
				currentState[prop] = state.old[prop];
			}
			return;
		}

		if (state[prop] === null) {
			delete currentState[prop];
		} else {
			currentState[prop] = state[prop];
		}
	});

	return next();
}
