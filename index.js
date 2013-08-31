var core = require("./core/core.js"),
	gateways = require("./core/gateways.js"),
	plugins = require("./core/plugins.js"),
	config = require("./config.js");

process.nextTick(function(){
	if(config.core.uid) process.setuid(config.core.uid);
});
