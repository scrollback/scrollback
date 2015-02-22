/* jshint browser: true */
/* global $ */

module.exports = function() {
	var $alert = $("<div>").html("Scrollback has been updated. <a class='appcache-reload-page'>Reload to start using the new version</a>.");

	// Check if a new cache is available on page load.
	$(applicationCache).on("updateready", function() {
		if (applicationCache.status === applicationCache.UPDATEREADY) {
			$alert.alertbar({
				type: "info",
				id: "appcache-updateready-notify"
			});
		}
	});

	$alert.on("click", ".appcache-reload-page", function() {
		location.reload();
	});
};
