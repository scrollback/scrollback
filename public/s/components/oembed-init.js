/* jshint browser: true */
/* global $ */

// Initialize jquery-oembed-all : https://github.com/starfishmod/jquery-oembed-all
$(document).on('DOMNodeInserted', function(e) {
	if ($(e.target).hasClass("chat-item") && $.fn.oembed) {
		$(e.target).children(".chat-message").children("a").oembed();
	}
});
