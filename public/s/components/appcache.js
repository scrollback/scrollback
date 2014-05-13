/* jslint browser: true, indent: 4, regexp: true*/

// Check if a new cache is available on page load.
window.addEventListener('load', function() {
	window.applicationCache.addEventListener('updateready', function() {
		if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
			window.location.reload();
		}
	}, false);

}, false);
