/* jshint browser: true */
/* global $, format, chatArea, libsb */

$(function() {
	var $entry = $(".chat-entry"),
		$input = $(".chat-input");
	
	// Focus chat entry on pageload
	$entry.focus();
	
	$entry.keypress(function(e) {
		if(e.which == 13 && !e.shiftKey) {
			e.preventDefault();
			var text = format.htmlToText($entry.html());
			$entry.text("");
			libsb.emit('text-up', {text: text});
		}
		setTimeout(function() {
			chatArea.setBottom($input.outerHeight());
		}, 0);
	});
});
