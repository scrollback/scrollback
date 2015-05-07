/* jshint browser: true */
/* global $ */

"use strict";

module.exports = () => {
	if (window.Android) {
		return;
	}

	let $alert = $("<div>").html("Scrollback has been updated. <a class='appcache-reload-page'>Reload to start using the new version</a>.");

	// Check if a new cache is available on page load.
	if (window.applicationCache) {
	    window.applicationCache.addEventListener("updateready", () => {
			if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
				$alert.alertbar({
					type: "info",
					id: "appcache-updateready-notify"
				});
			}
		});
	}

	$alert.on("click", ".appcache-reload-page", () => location.reload());
};
