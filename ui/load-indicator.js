/* jshint browser: true */
/* global $, lace */

$(function() {
	if ($.fn.attrchange) {
		$("body").attrchange(function() {
			if ($("body").attr("class") && $("body").attr("class").match(/mode-/)) {
				lace.progress.hide();
			}
		});
	} else {
		setTimeout(function() {
			lace.progress.hide();
		}, 300);
	}
});
