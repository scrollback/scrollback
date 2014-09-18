/* jshint browser: true */
/* global $*/
var parseURL = require("../lib/parseURL.js");
var actionQueue = require("./actionQueue.js")();

function init(libsb) {
	$(function () {
		var state = {};
		if (window.phonegap || window.cordova) {
			state.phonegap = true;
			state.mode = "home";
		} else {
			state = parseURL(window.location.pathname, window.location.search);
			if(state.embed) delete state.embed;
		}

		state.source = "boot";
		state.connectionStatus = false;
		libsb.emit("navigate", state, function (err) {
			if (err) return console.log(err);
			libsb.hasBooted = true;
			actionQueue.processAll();
		});
	});
}

module.exports = function (l) {
	init(l);
};
