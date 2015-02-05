/* jshint browser: true */
/* global $*/
var urlUtils = require("../lib/url-utils.js");
var actionQueue = require("./actionQueue.js")();

function init(libsb) {
	$(function() {
		var state = urlUtils.parse(window.location.pathname, window.location.search);
		
		if (state.platform && state.platform === 'android') {
			// for fixing backward compatibility with the older app versions.
			// delete it once everyone has moved to a newer app version.
			state.platform = 'cordova';   
		}
		
		
		state.cordova = (!!(state.platform && (/cordova/i).test(state.platform)));

		if (state.embed) delete state.embed;

		state.source = "boot";
		state.connectionStatus = "connecting";

		libsb.emit("navigate", state, function(err) {
			if (err) return console.log(err);
			libsb.hasBooted = true;
			actionQueue.processAll();
		});
	});
}

module.exports = function(l) {
	init(l);
};
