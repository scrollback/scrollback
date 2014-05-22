/* jshint browser: true */
/* global $ */

$(function() {
	// Check if inside an iframe
	if (window.parent) {
		// Add embed class to body
		$("body").addClass("embed");

		// Handle minimize button click
		if (window.parent.postMessage) {
			$(".minimize-button").on("click", function() {
				window.parent.postMessage("minimize", "*");
			});
		}
	}
});
