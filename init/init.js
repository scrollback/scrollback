"use strict";

var bootComplete = false;

function init(core) {
	var newState = {}, initNext;

	if (!newState.app) {
		newState.app = {};
	}

	newState.app.connectionStatus = "connecting";

	core.emit("boot", newState, function() {
		newState.app.bootComplete = true;
		bootComplete = true;

		core.emit("setstate", newState);

		if (initNext) {
			initNext();
		}
	});

	core.on("init-up", function(action, next) {
		if (!bootComplete) {
			initNext = next;
		} else {
			next();
		}
	}, 1000);
}

module.exports = init;
