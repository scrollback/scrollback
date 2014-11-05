/* jshint browser: true */
/* global jQuery */

(function($) {

	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,
		isOnPropertyChangeSupported = "onpropertychange" in document.body,
		isDOMAttrModifiedSupported = (function() {
			var $el = $("<div>"),
				flag = false;

			$el.on("DOMAttrModified", function() {
				flag = true;
			});

			$el.attr("class", "foo");

			return flag;
		}());

	$.fn.attrchange = function(callback) {
		var options, observer;

		if (typeof callback !== "function") {
			return;
		}

		if (MutationObserver) {
			options = {
				subtree: false,
				attributes: true
			};

			observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(e) {
					callback.call(e.target, e.attributeName);
				});
			});

			return this.each(function() {
				observer.observe(this, options);
			});
		} else if (isDOMAttrModifiedSupported) {
			return this.on("DOMAttrModified", function(e) {
				callback.call(this, e.attrName);
			});
		} else if (isOnPropertyChangeSupported) {
			return this.on("propertychange", function(e) {
				callback.call(this, e.propertyName);
			});
		}
	};

})(jQuery);
