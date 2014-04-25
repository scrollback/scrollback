/* jshint browser: true */
/* global $, format, textArea, libsb */

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
			textArea.setBottom($input.outerHeight());
		}, 0);
	});
});
