/* jshint browser: true */
/* global $, libsb, lace */

$(function() {
	$(".follow-button").on("click", function() {
		if ($("body").hasClass("role-follower")) {
			libsb.part(window.currentState.room);
			$("body").removeClass("role-follower");
		} else {
			libsb.join(window.currentState.room);
			$("body").addClass("role-follower");
		}

		lace.animate.transition("grow", $(this));
	});
});
