/*jslint browser: true, indent: 4, regexp: true*/
/*global $*/

$(function() {
	var outer, inner, swy;

	outer = $("<div></div>").css({
			width: "100px",
			height: "100px",
			overflow: "auto"
		}).appendTo(document.body);

	inner = $("<div></div>").appendTo(outer);

	swy = inner.innerWidth() - inner.height(101).innerWidth();

	outer.remove();

	$(".hide-scroll").
	css({
		"overflow-y" : "scroll",
		"margin-right" : "-=" + swy
	}).
	scroll(function() {
	}).
	mousemove(function() {
	});
});
