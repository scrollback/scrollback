/* jshint browser: true */
/* global $ */

module.exports = function(core, config, store) {
	var $alert;

	if (store.get("context", "env") === "android") {
		return;
	}

	$alert = $("<div>").html("Scrollback has been updated. <a class='appcache-reload-page'>Reload to start using the new version</a>.");

	// Check if a new cache is available on page load.
	if (window.applicationCache) {
	    window.applicationCache.addEventListener("updateready", function() {
			if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
				$alert.alertbar({
					type: "info",
					id: "appcache-updateready-notify"
				});
			}
		});
	}

	$alert.on("click", ".appcache-reload-page", function() {
		location.reload();
	});
};
