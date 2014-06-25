/* jshint browser: true */
/* global $, libsb, format */

$(function() {
	var $entry = $(".chat-entry"),
		lastMsg, currMsg, currThread;

	$.fn.resetConv = function() {
		var classes = $("body").attr("class").replace(/conv-\d+/g, "").trim();

		$("body").attr("class", classes);
	};

	$.fn.selectMsg = function() {
		$.fn.resetConv();

		currMsg = this.attr("id");
		currThread = this.attr("data-thread");

		if (currThread) {
			$("body").addClass("conv-" + currThread.substr(-1));
		}

		$(".chat-item").not(this).removeClass("current");

		this.addClass("current").get(0).scrollIntoView(true);

		var nick = this.find(".chat-nick").text(),
			msg = format.htmlToText($entry.html()).trim().replace(/@\S+[\s+{1}]?$/, "");

		if (msg.indexOf(nick) < 0 && libsb.user.id !== nick) {
			msg = msg + " @" + nick + " ";
		}

		$entry.html(format.textToHtml(msg)).focus();

		if ($.fn.setCursorEnd) {
			$entry.setCursorEnd();
		}

		return this;
	};

	$(document).on("click", ".chat-item", function() {
		$(this).selectMsg();
	});

	$(document).on("keydown", function(e){
		if (e.keyCode === 38 || e.keyCode === 40) {
			if ($(".chat-item.current").length) {
				var $chat = $(".chat-item.current"),
					$el;

				if (e.keyCode === 38 && $chat.prev().length) {
					e.preventDefault();
					$el = $chat.prev();
				} else if (e.keyCode === 40) {
					e.preventDefault();

					if ($chat.next().length) {
						$el = $chat.next();
					} else {
						$.fn.resetConv();
						$chat.removeClass("current");
					}
				}

				if ($el) {
					$el.addClass("clicked").selectMsg();

					setTimeout(function() {
						$el.removeClass("clicked");
					}, 500);
				}
			} else {
				if (e.target === $entry.get(0) && $(".chat-item").last().length && e.keyCode === 38) {
					e.preventDefault();

					$(".chat-item").last().selectMsg();
				}
			}
		}
	});

	libsb.on("text-up", function(text, next) {
		lastMsg = text.id;

		next();
	}, 50);

	libsb.on("text-dn", function(text, next) {
		if (text.id === lastMsg || (text.threads && text.threads.length && text.threads[0].id === currThread)) {
			$("#chat-" + text.id).selectMsg();
		}

		next();
	}, 50);

	$(document).on("click", ".chat-mark-long", function() {
		$(this).toggleClass("active").scrollTop(0);
	});
});
