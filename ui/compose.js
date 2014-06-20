/* jshint browser: true */
/* global $, chatArea, libsb, format */

$(function() {
	var $entry = $(".chat-entry"),
		$placeholder = $(".chat-placeholder"),
		$input = $(".chat-input");

	// Focus chat entry on pageload
	$entry.focus();

	function sendMsg(){
		var text = format.htmlToText($entry.html());

		$entry.text("");
        console.log("entered text", text);
		if (!text) return;
		if (window.currentState && window.currentState.roomName) {
            console.log("saying ", text);
			libsb.say(window.currentState.roomName, text, window.currentState.thread);
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

	$entry.on("paste", function(e) {
		e.preventDefault();

		var text = e.originalEvent.clipboardData.getData("Text");

		$entry.html(format.textToHtml(text)).scrollTop($entry[0].scrollHeight);

		if ($.fn.setCursorEnd) {
			$entry.setCursorEnd();
		}
	});

	$entry.on("DOMSubtreeModified input paste", function() {
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
