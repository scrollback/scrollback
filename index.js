var core = require("./core/core.js"),
	gateways = require("./core/gateways.js"),
	config = require("./config.js");
	
core.init(gateways);

if(config.core.uid) process.setuid(config.core.uid);
process.title = config.core.name;