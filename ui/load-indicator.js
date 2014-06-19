/* jshint browser: true */
/* global $ */

$(function() {
	var lace = require("../lib/lace.js");

	$("body").attrchange(function() {
		if ($(".overlay").length && $("body").attr("class") && $("body").attr("class").match(/mode-/)) {
//				lace.animate.transition("fadeout", ".overlay", function() {
			$(".overlay").remove();
				lace.progress.hide();
//			});
		}
	});
});
