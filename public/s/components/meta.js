/* jshint browser: true */
/* global $ */

$(function() {
	'use strict';

	$(".tab").on("click", function() {
		var tab = $(this).attr("class").match(/\btab-([a-z]+)\b/);
		if(!tab) return;
		tab = tab[1]; // match returns an array with the capture groups starting at index 1.
		
		$(".tab.current, .pane.current").removeClass("current");
		$(".tab-" + tab + ", .pane-" + tab).addClass("current");
	});
});
