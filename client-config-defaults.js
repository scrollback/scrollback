var merge = require("./merge-config.js");

var defaults = {
	server: {
		protocol: "http:",
		host: "localhost:7528"
	},
    localStorage: {
        version: 1.00
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
	}
};

module.exports = (function() {
	var changes = {};
	changes = require("./client-config.js");
	if(!changes) changes = {};
	return merge(defaults, changes);
}());
