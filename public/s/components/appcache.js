/* jslint browser: true, indent: 4, regexp: true*/
/* global $ */

$(function() {
	// Check if a new cache is available on page load.
	$(applicationCache).on("updateready", function() {
		if (applicationCache.status === applicationCache.UPDATEREADY) {
			location.reload();
		}
	});

	// Check if online or not
	$(window).on("offline", function() {
		$("body").addClass("offline");
	});

	$(window).on("online", function() {
		$("body").removeClass("offline");
	});
});
