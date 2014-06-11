/* jshint browser: true */
/* global $, chatArea, libsb */

$(function() {
	var $entry = $(".chat-entry"),
		$placeholder = $(".chat-placeholder"),
		$input = $(".chat-input");

	// Focus chat entry on pageload
	$entry.focus();

	function sendMsg(){
		var text = $entry.text().trim();
		$entry.text("");

		if (!text) return;
		if (window.currentState && window.currentState.room) {
			libsb.say(window.currentState.room, text, window.currentState.thread);
		} else {
			// show the error that not part of any room yet.
		}

		setTimeout(function() {
			chatArea.setPosition($input.outerHeight());
		}, 0);

		var classes = $("body").attr("class").replace(/conv-\d+/g, "");

		$("body").attr("class", classes);
	}

	function setPlaceHolder() {
		if ($entry.text().trim() === "") {
			$placeholder.text("Reply as " + libsb.user.id );
		} else {
			$placeholder.empty();
		}
	}

	libsb.on("init-dn", function(action, next) {
		setPlaceHolder();

		next();
	}, 10);

	$input.on("click", function() {
		$entry.focus();
	});

	$entry.on("DOMSubtreeModified keyup input paste change", function() {
		chatArea.setPosition($input.outerHeight());

		setPlaceHolder();
	});

	$entry.on("keypress", function(e) {
		if(e.which === 13 && !e.shiftKey) {
			e.preventDefault();
			sendMsg();
		}
	});

	$(".chat-send").on("click", sendMsg);
});
