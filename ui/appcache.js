/* jslint browser: true, indent: 4, regexp: true*/
/* global $, lace */

$(function() {
	// Check if a new cache is available on page load.
	$(applicationCache).on("updateready", function() {
		if (applicationCache.status === applicationCache.UPDATEREADY) {
			lace.alert.show({ type: "info", body: "A new version of the client has been downloaded. <a class='reload-page'>Reload to start using it</a>." });
		}
	});

	$(document).on("click", ".reload-page", function() {
		location.reload();
	});
});
