/* jshint browser: true */
var core, config, store;
function init() {
	var state = {};
	if(!state.app){
		state.app = {};
	}
	state.app.connectionStatus = "connecting";
	core.emit("boot", state, function() {
		core.emit("setstate", {app:{bootComplete: true}});
	});
}

module.exports = function(c, conf, s) {
	core = c;
	config = conf;
	store = s;
	init();
};
