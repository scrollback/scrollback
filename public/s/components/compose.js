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
			console.log({text: text, room: window.location.pathname.split("/")[1]});
			libsb.emit('text-up', {text: text, to: window.location.pathname.split("/")[1]});
		}
		setTimeout(function() {
			textArea.setBottom($input.outerHeight());
		}, 0);
	});
});
