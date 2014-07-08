/* jshint browser: true */
/* global $, libsb, format */

var chatArea = require("./chat-area.js");

$(function() {
	var $entry = $(".chat-entry"),
		$placeholder = $(".chat-placeholder"),
		$input = $(".chat-input"),
		sendMsg = function(){
			var text = format.htmlToText($entry.html());

			$entry.text("");

			if (!text) return;

			if (window.currentState && window.currentState.roomName) {
				libsb.say(window.currentState.roomName, text, window.currentState.thread);
			} else {
				// show the error that not part of any room yet.
			}

			chatArea.setPosition($input.outerHeight());

			var classes = $("body").attr("class").replace(/conv-\d+/g, "");

			$("body").attr("class", classes);
		},
		setPlaceHolder = function() {
			if (libsb.user && libsb.user.id && $entry.text().trim() === "") {
				$placeholder.text("Reply as " + libsb.user.id.replace(/^guest-/, ""));
			} else {
				$placeholder.empty();
			}
		};

	// Focus chat entry on pageload
	$entry.focus();
	setPlaceHolder();

	libsb.on("init-dn", function(action, next) {
		setPlaceHolder();

		next();
	}, 10);

	$(window).on("resize", function() {
		chatArea.setPosition($input.outerHeight());
	});

	$input.on("click", function() {
		$entry.focus();
	});

	$entry.on("paste", function() {
		setTimeout(function() {
			var text = format.htmlToText($entry.html());

			$entry.html(format.textToHtml(text)).scrollTop($entry[0].scrollHeight);

			if ($.fn.setCursorEnd) {
				$entry.setCursorEnd();
			}
		}, 5);
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
