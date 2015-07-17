/* eslint-env browser */

"use strict";
var Widget = require("./widget.js");

window.scrollback = function scrollback(opts, callback) {
	if(typeof opts !== "object") {
		console.log("Expected scrollback widget options, got", opts, "instead.");
		console.log("See https://github.com/scrollback/scrollback/wiki/Embed-API-2 for docs");
		return;
	}

	var w = new Widget(opts);
	function done () { callback(w); }
	if(typeof callback === "function") {
		w.once("ready", done);
	}
};

