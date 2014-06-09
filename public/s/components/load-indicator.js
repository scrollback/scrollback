/* jshint browser: true */
/* global $, lace */

$(function() {
	var loadIndicator = setInterval(function() {
		if ($("body").attr("class") && $("body").attr("class").match(/mode-/)) {
			lace.animate.transition("fadeout", ".overlay", function() {
				$(this).remove();
				lace.progress.hide();
				clearInterval(loadIndicator);
			});
		}
	}, 10);
});
