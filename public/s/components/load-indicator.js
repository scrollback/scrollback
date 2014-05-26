/* jshint browser: true */
/* global $, lace */

$(function() {
	console.log("loading");

	var loadingIndicator = setInterval(function() {
		if ($("body").attr("class") && $("body").attr("class").match(/-mode/)) {
			lace.animate.transition("fadeout", ".overlay", function() {
				$(".overlay").remove();
				lace.progress.hide();
				clearInterval(loadingIndicator);
			});
		}
	}, 10);
});
