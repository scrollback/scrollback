/* jshint node:true, browser:true */
/* global libsb, currentState, $ */

libsb.on("navigate", function(state, next) {
	if (state.source === "boot" && state.hasOwnProperty('webview')) {
		$('body').addClass('webview-true webview');
	}
	next();
}, 600);

libsb.on('init-up', function(init, next) {
	if (currentState.hasOwnProperty('webview')) {
		var webview = currentState.webview;
		if (webview.hasOwnProperty('nick')) {
			init.suggestedNick = webview.nick;
		}
	}
	next();
}, 500);