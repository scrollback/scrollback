/* jshint browser: true */
/* global jQuery */

(function($) {
	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
	function isDOMAttrModifiedSupported() {
		var $el = $("<div>"),
			flag = false;

		$el.on("DOMAttrModified", function() {
			flag = true;
		});

		$el.attr("class", "foo");

		return flag;
	}

	$.fn.attrchange = function(callback) {
		if (MutationObserver) {
			var options = {
				subtree: false,
				attributes: true
			};

			var observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(e) {
					callback.call(e.target, e.attributeName);
				});
			});

			return this.each(function() {
				observer.observe(this, options);
			});
		} else if (isDOMAttrModifiedSupported()) {
			return this.on("DOMAttrModified", function(e) {
				callback.call(this, e.attrName);
			});
		} else if ("onpropertychange" in document.body) {
			return this.on("propertychange", function(e) {
				callback.call(this, e.propertyName);
			});
		}
	};
})(jQuery);
