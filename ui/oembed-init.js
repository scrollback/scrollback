/* jshint browser: true */
/* global $ */

$(function() {
	// Initialize jquery-oembed-all : https://github.com/starfishmod/jquery-oembed-all
	$(document).on('DOMNodeInserted', function(e) {
		if ($.fn.oembed && $(e.target).hasClass("chat-item")) {
			$(e.target).children(".chat-message").children("a").oembed();
		}
	});
});
