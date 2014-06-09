/* jshint browser: true */
/* global $, lace */

$(function() {
	$("body").attrchange(function() {
		if ($(".overlay").length && $("body").attr("class") && $("body").attr("class").match(/mode-/)) {
			lace.animate.transition("fadeout", ".overlay", function() {
				$(this).remove();
				lace.progress.hide();
			});
		}
	});
});
