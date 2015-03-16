/* jshint browser: true */
var core, config, store, bootComplete = false;
function init() {
	var newState = {}, initNext;
	if(!newState.app){
		newState.app = {};
	}
	newState.app.connectionStatus = "connecting";
	core.emit("boot", newState, function() {
		newState.app.bootComplete = true;
		bootComplete = true;
		core.emit("setstate", newState);
		if(initNext) initNext();
	});
	core.on("init-up", function(action, next) {
		console.log(action, bootComplete);
		if(!bootComplete) initNext = next;
		else next();
	}, 1000);
}

module.exports = function(c, conf, s) {
	core = c;
	config = conf;
	store = s;
	require("./url-manager.js")(core, config, store);
	init();
};
