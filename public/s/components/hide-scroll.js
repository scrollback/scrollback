/* global $, document */

$(function() {
	var el = $("<div>").css({
		visibility: "hidden", width: "100px", height: "100px",
		overflow: "scroll", padding: "200px",
		msOverflowStyle: "scrollbar"
	}).appendTo(document.body),
		swy = el[0].offsetWidth - el[0].clientWidth;
	
	el.remove();
	
	$('.hide-scroll').
	css({ overflowY: "scroll", right: "-="+swy }).
	scroll(function() {
	}).
	mousemove(function() {
	});
});
