/* jshint browser: true */

module.exports = (function() {
	var cache = {
		CSS: {}
	};

	return {
		CSS: function(prop, value) {
			var cached = prop + "_" + value,
				element;

			if ("CSS" in window && "supports" in window.CSS) {
			    return window.CSS.supports(prop, value);
			}

			if ("supportsCSS" in window) {
			    return window.supportsCSS(prop, value);
			}

			if (!(cached in cache.CSS)) {
				element = document.createElement("div");

				element.style[prop] = value;

				cache.CSS[cached] = (element.style[prop] === value);
			}

			return cache.CSS[cached];
		}
	};

}());
