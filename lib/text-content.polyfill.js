/* eslint-env browser */

"use strict";

// Polyfill for Node.textContent for IE8 and below
(function() {
	var innerText;

	if (Object.defineProperty && Object.getOwnPropertyDescriptor &&
	    Object.getOwnPropertyDescriptor(Element.prototype, "textContent") &&
	    !Object.getOwnPropertyDescriptor(Element.prototype, "textContent").get) {
			innerText = Object.getOwnPropertyDescriptor(Element.prototype, "innerText");

			Object.defineProperty(Element.prototype, "textContent", {
				get: function() {
					return innerText.get.call(this);
				},
				set: function(text) {
					return innerText.set.call(this, text);
				}
			}
		);
	}
})();
