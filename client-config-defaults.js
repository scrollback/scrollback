var merge = require("./merge-config.js");
var defaults = {
	server: {
		protocol: "http:",
		host: "local.scrollback.io"
	},
    localStorage: {
        version: 1.00
    }
};

module.exports = (function() {
	var changes = {};
	changes = require("./client-config.js");
	if(!changes) changes = {};
	return merge(defaults, changes);
}());