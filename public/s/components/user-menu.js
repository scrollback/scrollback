/* jshint browser: true */
/* global $ */

$(function() {
	$(".has-popover").on("click", function() {
		$(".popover-body").removeClass().addClass("popover-body").empty();
	});

	$(".guest").on("click", function() {
		$(".popover-body").addClass("user-menu").append('Sign in to scrollback with<a class="button facebook">Facebook</a><a class="button persona">Persona</a>');
	});

	$(".avatar").on("click", function() {
		$(".popover-body").addClass("user-menu").append('<ul><li><a href="">Report an issue</a></li><li><a href="">Logout</a></li></ul>');
	});
});
