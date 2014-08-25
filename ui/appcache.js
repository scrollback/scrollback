/* jslint browser: true, indent: 4, regexp: true*/
/* global $ */

$(function() {
	var lace = require("../lib/lace.js");

	// Check if a new cache is available on page load.
	$(applicationCache).on("updateready", function() {
		if (applicationCache.status === applicationCache.UPDATEREADY) {
			lace.alert.show({
				type: "info",
				body: "Scrollback has been updated. <a class='appcache-reload-page'>Reload to start using the new version</a>.",
				id: "appcache-updateready-notify"
			});
		}
	});


	$(document).on("click", ".appcache-reload-page", function() {
		location.reload();
	});
});
