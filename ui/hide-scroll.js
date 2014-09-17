/*jslint browser: true, indent: 4, regexp: true*/
/*global $*/

$(function() {
	var outer, inner, swy, css,
		$el = $(".hide-scroll");

	outer = $("<div></div>").css({
			width: "100px",
			height: "100px",
			overflow: "auto"
		}).appendTo(document.body);

	inner = $("<div></div>").appendTo(outer);

	swy = inner.innerWidth() - inner.height(101).innerWidth();

	outer.remove();

	css = {
		"overflow-y": "scroll",
		"margin-right": "-=" + swy
	};

	$el.css(css);

	$(window).on("resize", function() {
		$el.css(css);

		clearTimeout($(this).data("scrollbarTimer"));

		$(this).data("scrollbarTimer", setTimeout(function() {
			$el.css(css);
		}, 1000));
	});
});
