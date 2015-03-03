/* jshint browser: true */
var core, config, store;
function init() {
	var newState = {};
	if(!newState.app){
		newState.app = {};
	}
	newState.app.connectionStatus = "connecting";
	console.log("emitting boot");
	core.emit("boot", newState, function() {
		newState.app.bootComplete = true;
		console.log("emitting first setstate", newState);
		core.emit("setstate", newState);
	});
}

module.exports = function(c, conf, s) {
	core = c;
	config = conf;
	store = s;
	require("./url-manager.js")(core, config, store);
	init();
};
