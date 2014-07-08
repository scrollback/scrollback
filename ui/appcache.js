/* jslint browser: true, indent: 4, regexp: true*/
/* global $ */

$(function() {
	var lace = require("../lib/lace.js");

	// Check if a new cache is available on page load.
	$(applicationCache).on("updateready", function() {
		if (applicationCache.status === applicationCache.UPDATEREADY) {
			lace.alert.show({ type: "info", body: "A new version of the client has been downloaded. <a class='reload-page'>Reload to start using it</a>.", id: "appcache-updateready-notify" });
		}
	});

	$(document).on("click", ".reload-page", function() {
		location.reload();
	});
});
