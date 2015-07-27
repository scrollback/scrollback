/* eslint-env browser */

"use strict";
var Widget = require("./widget.js"),
	calls = window.scrollback && window.scrollback.scrollback || [];

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

if(calls.forEach) { calls.forEach(function(args) { window.scrollback.apply(null, args); }); }

/*
<script>
(function(w,d,f,s,a,e){w[f]=function(){a.push(arguments)};w[f][f]=a
e=d.createElement(s);e.async=1;e.src='https://'+f+'.io/s/sb.js'
d.body.appendChild(e)}(window,document,'scrollback','script',[]))

scrollback({ room: "your-room-id" });
// See https://github.com/scrollback/scrollback/wiki/Embed-API-2 for docs 
</script>
*/