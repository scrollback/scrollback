/* jshint browser: true */
/* global $, libsb, lace */

$(function() {
	$(".follow-button").on("click", function() {
		if ($("body").hasClass("following")) {
			libsb.part(window.currentState.room);
			$("body").removeClass("following");
		} else {
			libsb.join(window.currentState.room);
			$("body").addClass("following");
		}

		lace.animate.transition("grow", $(this), function() {});
	});
});
