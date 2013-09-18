var core = require("./core/core.js"),
	gateways = require("./core/gateways.js"),
	plugins = require("./core/plugins.js"),
	config = require("./config.js");

process.nextTick(function(){
	// The ident server binds to port 113 after a while.
	if(config.core.uid) process.setuid(config.core.uid);
});
process.title = config.core.name;
