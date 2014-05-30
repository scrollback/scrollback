/* jshint browser: true */
/* global $, chatArea, libsb */

$(function() {
	var $entry = $(".chat-entry"),
		$input = $(".chat-input");

	// Focus chat entry on pageload
	$entry.focus();


	function sendMsg(){
		var text = $entry.text();
		text = text.trim();
		$entry.text("");
		if(!text) return;
		if (window.currentState && window.currentState.room) {
			libsb.say(window.currentState.room, text, window.currentState.thread);
		}else {
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
