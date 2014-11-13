/* jshint browser: true */
/* global $, libsb, format */

var chatArea = require("./chat-area.js");

$(function() {
	var $entry = $(".chat-entry"),
		$placeholder = $(".chat-placeholder"),
		$input = $(".chat-input"),
		$convdot = $(".chat-conv-dot"),
		newThread = false,
		sendMsg = function() {
			var text = format.htmlToText($entry.html()).trim();

			$entry.empty();

			if (!text) {
				return;
			}

			if (window.currentState && window.currentState.roomName) {
				libsb.say(window.currentState.roomName, text, window.currentState.thread);
			} else {
				// show the error that not part of any room yet.
			}

			chatArea.setPosition($input.outerHeight());

			var classes = $("body").attr("class").replace(/conv-\d+/g, "");

			$("body").attr("class", classes);
		},
		setPlaceHolder = function(content) {
			if (libsb.user && libsb.user.id && !$entry.text().trim()) {
				if (typeof content !== "string") {
					content = "Reply as " + libsb.user.id.replace(/^guest-/, "");

					if (!window.currentState.thread) {
						content += " or <a class='text-button js-new-discussion'>start a discussion</a>";
					}
				}

				$placeholder.html(content);
			} else {
				$placeholder.empty();
			}
		};

	// Focus chat entry on pageload
	if (document.hasFocus()) {
		$entry.focus();
	}

	setPlaceHolder();

	libsb.on("init-dn", function(action, next) {
		setPlaceHolder();

		next();
	}, 10);

	libsb.on("navigate", function(state, next) {
		if (state.old) {
			if (state.old.roomName !== state.roomName) {
				$entry.empty();
			}

			if (state.old.thread !== state.thread) {
				setPlaceHolder();
			}
		}

		next();
	}, 50);

	$(window).on("resize", function() {
		chatArea.setPosition($input.outerHeight());
	});

	$(document).on("keydown", function(e) {
		if (e.keyCode === 27) {
			newThread = false;

			setPlaceHolder();
		}
	});

	$input.on("click", function(e) {
		if ($(e.target).closest(".js-new-discussion").length) {
			newThread = true;

			setPlaceHolder("Type discussion title");

			$convdot.addClass("animating");

			setTimeout(function() {
				$convdot.removeClass("animating");
			}, 500);
		} else if ($(e.target).closest(".chat-conv-dot-wrap").length) {
			newThread = false;

			setPlaceHolder();
		}

		$entry.focus();
	});

	libsb.on("text-up", function(text, next) {
		if (newThread) {
			if (!text.labels) text.labels = [];
			text.labels.push({startOfThreadManual: 1});
			text.threads = [{
				id: "new",
				score: 1.0
			}];
		}

		newThread = false;

		next();
	}, 300);

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
		if (e.which === 13 && !e.shiftKey) {
			e.preventDefault();
			sendMsg();
		}
	});

	libsb.on("navigate", function(state, next) {
		var chatText = "";

		if (state.old && state.old.connectionStatus != state.connectionStatus) {
			if (state.connectionStatus == "online") {
				setPlaceHolder();

				$entry.attr("contenteditable", true);

				if ($entry.data("text") && $entry.data("text").room === window.currentState.roomName) {
					chatText = $entry.data("text").content || "";

					$entry.text(chatText).data("text", null);
				}
			} else {
				chatText = $entry.text();

				$entry.data("text", {
					room: window.currentState.roomName,
					content: chatText
				}).attr("contenteditable", false).empty();

				$placeholder.text("Cannot send messages while offline.");
			}
		}

		next();
	}, 600);

	$(".chat-send").on("click", sendMsg);
});
