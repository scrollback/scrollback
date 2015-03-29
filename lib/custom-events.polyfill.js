/* jshint browser: true */

// Polyfill for creating CustomEvents on IE9/10/11 and Android webview
if (typeof window.CustomEvent !== "function") {
	window.CustomEvent = function(type, eventInitDict) {
		var newEvent = document.createEvent("CustomEvent");

		newEvent.initCustomEvent(type,
								 !!(eventInitDict && eventInitDict.bubbles),
								 !!(eventInitDict && eventInitDict.cancelable),
								 (eventInitDict ? eventInitDict.details : null));

		return newEvent;
	};
}
