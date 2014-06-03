/* jslint browser: true, indent: 4 */
/* global $ */

$(function() {
	$("body").addClass("step-1");

	$("form").on("submit", function() {
		return false;
	});

	$("#preview-room").on("submit", function() {
		window.open("http://next.scrollback.io/" + $("#room-name").val(), '_blank');
	});

	$("#preview-embed-prev").on("click", function() {
		$("body").removeClass("step-1").addClass("step-2");
	});

	$("#preview-embed").on("submit", function() {
		window.open("http://next.scrollback.io/pwn/" + $("#room-name").val() + "/" + $("#web-address").val(), '_blank');
	});
});
