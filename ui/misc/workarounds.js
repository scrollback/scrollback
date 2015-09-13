/* eslint-env browser */
/* global $ */

"use strict";

module.exports = () => {
	// Hack to get event bubbling work properly in iOS safari
	if (navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
		navigator.userAgent.match(/AppleWebKit/) &&
		navigator.userAgent.match(/Safari/)) {
		// This also matches Chrome on iOS :(
		$("body").css({
			cursor: "pointer"
		});
	}
};
