/* jshint browser: true */
/* global $*/
var parseURL = require("../lib/parseURL.js");
var actionQueue = require("./actionQueue.js")();

function init(libsb) {
	$(function() {
		var state = {};
		state = parseURL(window.location.pathname, window.location.search);
		
		if(state.platform) {
			state.phonegap = true;
			state.mode = "home";
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
