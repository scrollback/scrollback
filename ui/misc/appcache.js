/* eslint-env browser */
/* global $ */

"use strict";

module.exports = (core, config) => {
	let $alert = $("<div>").html(config.appName + " has been updated. <a class='appcache-reload-page'>Restart to use the new version</a>.");

	// Check if a new cache is available on page load.
	if (window.applicationCache) {
		window.applicationCache.addEventListener("updateready", () => {
			$alert.alertbar({
				type: "info",
				id: "appcache-updateready-notify"
			});
		});
	}

	$alert.on("click", ".appcache-reload-page", () => location.reload());
};
