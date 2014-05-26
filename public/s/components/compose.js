/* jshint browser: true */
/* global $, format, textArea, libsb */

$(function() {
	var $entry = $(".chat-entry"),
		$input = $(".chat-input");

	// Focus chat entry on pageload
	$entry.focus();


	function sendMsg(){
		var text = format.htmlToText($entry.html());

		if(!text) return;

		$entry.text("");

		if (window.currentState && window.currentState.room) {
			libsb.say(window.currentState.room, text, window.currentState.thread);
		}else{
			// show the error that not part of any room yet.
		}

		setTimeout(function() {
			chatArea.setBottom($input.outerHeight());
		}, 0);
	}

	$entry.keypress(function(e) {
		if(e.which == 13 && !e.shiftKey) {
			e.preventDefault();
			sendMsg();
		}
	});

	$(".chat-send").on("click", sendMsg);
});
