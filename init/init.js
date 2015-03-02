/* jshint browser: true */
var urlUtils = require("../lib/url-utils.js");
var core, config, store;
function init() {
	var state = urlUtils.generateState(window.location.pathname, window.location.search);
	if(!state.app){
		state.app = {};
	}
	state.app.connectionStatus = "connecting";
	core.emit("boot", state, function() {
		core.emit("setState", {app:{bootComplete: true}});
	});
}

module.exports = function(c, conf, s) {
	core = c;
	config = conf;
	store = s;
	init();
};
