"use strict";

var roomUtils = require("./room-utils.js");

module.exports = function(state, compact, config) {
	var mode = state.nav.mode,
		room = state.nav.room,
		threadId, threadObj, title, appName, global;

		if(!config) config = {};
		global = config.global || {};
		appName = (config.appName || global.appName || "scrollback");


	switch (mode) {
	case "room":
		title = roomUtils.getName(room) + (compact ? "" : " on " + appName);
		break;
	case "chat":
		threadId = state.nav.thread;

		if (state.indexes && state.indexes.threadsById && state.indexes.threadsById[threadId]) {
			threadObj = state.indexes.threadsById[threadId];
		}

		if (threadId) {
			title = threadObj && threadObj.title ? threadObj.title + (compact ? "" : " - " + roomUtils.getName(room)) : roomUtils.getName(room);
		} else {
			title = "All messages" + (compact ? "" : " - " + roomUtils.getName(room));
		}

		break;
	default:
		title = appName;
	}

	return title;
};
