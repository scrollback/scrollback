/* jshint browser: true */
/* global $*/
var urlUtils = require("../lib/url-utils.js");
var actionQueue = require("./actionQueue.js")();

function init(libsb) {
	$(function() {
		var state = {};
		state = urlUtils.parse(window.location.pathname, window.location.search);

		if ((/cordova-android/i).test(state.platform)) {
			state.cordova = true;
		}

		if(state.embed) delete state.embed;

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
