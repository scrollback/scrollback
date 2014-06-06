/* jshint browser: true */
/* global $ */

$(function() {
	if (window.parent.postMessage) {
		// Tell the parent that we are ready
		window.parent.postMessage("ready", "*");

		// Handle minimize button click
		$(".minimize-button").on("click", function() {
			window.parent.postMessage("minimize", "*");
		});

		// Handle fullview button click
		$(".fullview-button").on("click", function() {
			window.open((window.location.href).replace(/[&,?]embed=[^&,?]+/g, "").replace(/[&,?]theme=[^&,?]+/g, ""), '_blank');
		});
	}
});
