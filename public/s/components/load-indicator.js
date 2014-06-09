/* jshint browser: true */
/* global $, lace, libsb */

$(function() {
	libsb.on("navigate", function(state, next) {
		if ($(".overlay").length && $("body").attr("class") && $("body").attr("class").match(/mode-/)) {
			lace.animate.transition("fadeout", ".overlay", function() {
				$(this).remove();
				lace.progress.hide();
			});
		}

		next();
	});
});
