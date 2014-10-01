/* jshint browser: true */
/* global $ */

$(function() {
	if ($.fn.attrchange) {
		$("body").attrchange(function() {
			if ($("body").attr("class") && $("body").attr("class").match(/mode-/)) {
				$.progressbar("dismiss");
			}
		});
	} else {
		setTimeout(function() {
			$.progressbar("dismiss");
		}, 300);
	}
});
