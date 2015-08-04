"use strict";

var merge = require("./merge-config.js");

var defaults = {
	server: {
		protocol: "http:",
		host: "localhost:7528",
		apiHost: "localhost:7528"
	},
	pushNotification: {
		defaultPackageName: "io.scrollback.app"
	}
};

module.exports = (function() {
	var changes;

	try {
		changes = require("./client-config.js");
	} catch (e) {
		changes = {};
	}

	return merge(defaults, changes);
}());
