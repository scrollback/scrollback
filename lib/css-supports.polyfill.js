/* jshint browser: true */

// Polyfill for checking CSS supports
window.CSS = window.CSS || {};

if (typeof window.CSS.supports !== "function") {
	window.CSS.supports = (function() {
		var cache;

		if (typeof window.supportsCSS === "function") {
		    return window.supportsCSS;
		}

		return function(prop, value) {
			var params = prop + "_" + value,
				element;

			cache = cache || {};

			if (typeof cache[params] !== "boolean") {
				element = document.createElement("div");

				element.style[prop] = value;

				cache[params] = (element.style[prop] === value);
			}

			return cache[params];
		};
	}());
}
