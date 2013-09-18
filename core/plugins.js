var core = require("./core.js"),
	config = require("../config.js");

function start(name) {
	var plugin = require("../plugins/"+name+"/"+name+".js");
	plugin(core);
	return plugin;
}

process.nextTick(function() {
	config.plugins.forEach(function(name) {
		start(name);
	});
});

