/* jshint browser: true */
/* global $ */

$(function() {
	'use strict';

	// Handle tabs
	var tabs = [];
	
	// Handle tabs
	$(".tabs > li").each(function() {
		var classlist = $(this).attr("class").split(/ +/);

		for (var i = 0; i < classlist.length; i++) {
			if (classlist[i].length > 0 && classlist[i].match(/^tab-([a-z]+)$/)) {
				tabs.push(classlist[i]);
			}
		}
	});

	$(".tabs > li").on("click", function() {
		if (!$(this).hasClass("notab")) {
			for (var i = 0; i < tabs.length; i++) {
				if ($(this).hasClass(tabs[i])) {
					$("." + tabs[i]).addClass("current");
				} else {
					$("." + tabs[i]).removeClass("current");
				}
			}
		}
	});
});
