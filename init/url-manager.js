/* jshint browser: true */
var urlUtils = require("../lib/url-utils.js");


module.exports = function(core /*, config*/ ) {
	core.on("boot", function(state, next) {
		var s = urlUtils.generateState(window.location.pathname, window.location.search);
		Object.keys(s).forEach(function(key) {
			state[key] = s[key];
		});
		if (!state.nav.mode) state.nav.mode = "room";
		next();
	}, 1000);
};