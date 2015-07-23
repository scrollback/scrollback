"use strict";

module.exports = function(state, compact) {
	var mode = state.nav.mode,
		room = state.nav.room,
		threadId, threadObj, title;

	switch (mode) {
	case "room":
		title = room + (compact ? "" : " on Scrollback");
		break;
	case "chat":
		threadId = state.nav.thread;

		if (state.indexes && state.indexes.threadsById && state.indexes.threadsById[threadId]) {
			threadObj = state.indexes.threadsById[threadId];
		}

		if (threadId) {
			title = threadObj && threadObj.title ? threadObj.title + (compact ? "" : " - " + room) : room;
		} else {
			title = "All messages" + (compact ? "" : " - " + room);
		}

		break;
	default:
		title = "Scrollback";
	}

	return title;
};
