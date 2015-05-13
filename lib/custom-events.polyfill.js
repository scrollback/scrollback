/* eslint-env browser */

"use strict";

// Polyfill for creating CustomEvents on IE9/10/11 and Android webview
(function() {
	if (typeof window.CustomEvent !== "function") {
		window.CustomEvent = function(type, params) {
			var newEvent = document.createEvent("CustomEvent");

			params = params || { bubbles: false, cancelable: false };

			newEvent.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);

			return newEvent;
		};
	}
}());
