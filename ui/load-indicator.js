/* jshint browser: true */
/* global $ */

$(function() {
	var lace = require("../lib/lace.js"),
		$overlay = $(".overlay");

	if ($.fn.attrchange) {
		$("body").attrchange(function() {

			if ($overlay.length && $("body").attr("class") && $("body").attr("class").match(/mode-/)) {
				lace.animate.fadeout($overlay, function() {
					lace.progress.hide();
				});
			}
		});
	} else {
		setTimeout(function() {
			lace.animate.fadeout($overlay, function() {
				lace.progress.hide();
			});
		}, 300);
	}
});
