/* jshint browser: true */
/* global $ */

(function() {
	// Hack to get event bubbling work properly in iOS safari
	if (navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
		navigator.userAgent.match(/AppleWebKit/) &&
		navigator.userAgent.match(/Safari/)) {
		// This also matches Chrome on iOS :(
		$("body").css({ cursor: "pointer" });
	}
}());
