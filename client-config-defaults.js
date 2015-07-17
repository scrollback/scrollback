var merge = require("./merge-config.js");

var defaults = {
	server: {
		protocol: "http:",
		host: "localhost:7528",
		apiHost: "localhost:7528"
	},
	pushNotification:{},
	localStorage: {
		version: 1.0
	},
	appPriorities: {
		antiflood: 1000,
		validation: 900,
		loader: 850,
		sudo: 825,
		appLevelValidation: 812,
		authentication: 800,
		authorization: 700,
		antiabuse: 600,
		modifier: 500,
		gateway: 400,
		cache: 300,
		storage: 200,
		watcher: 100
	},
	weiner: {
		enabled: false,
		appid: "scrollback",
		protocol: "http:",
		host: "192.168.0.1:8080"
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
