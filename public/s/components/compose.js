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
		if (window.currentState && window.currentState.roomName) {
			libsb.say(window.currentState.roomName, text, window.currentState.thread);
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

	libsb.on("init-dn", function(action, next) {
		$entry.attr("data-placeholder", libsb.user.id );

		next();
	}, 10);
});
