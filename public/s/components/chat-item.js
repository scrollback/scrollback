/* jshint browser: true */
/* global $, libsb, format, lace */

$(function() {
	var $entry = $(".chat-entry");

	$.fn.resetConv = function() {
		var classes = $("body").attr("class").replace(/conv-\d+/g, "").trim();

		$("body").attr("class", classes);
	};

	$.fn.selectConv = function() {
		$.fn.resetConv();

		this.attr("class").split(" ").forEach(function(s) {
			var conv = s.match(/^conv-\d+$/);

			if (conv) {
				$("body").addClass(conv[0]);
			}
		});

		$entry.focus();

		return this;
	};

	$.fn.selectMsg = function() {
		$(".chat-item").not(this).removeClass("current");

		this.addClass("current");

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
		$(this).selectConv().selectMsg();
	});

	$(document).on("click", ".thread-item", function() {
		$(this).selectConv();
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
					$el.get(0).scrollIntoView(true);
					$el.addClass("clicked").selectConv().selectMsg();

					setTimeout(function() {
						$el.removeClass("clicked");
					}, 500);
				}
			} else {
				if (e.target === $entry.get(0) && $(".chat-item").last().length && e.keyCode === 38) {
					e.preventDefault();

					$(".chat-item").last().selectConv().selectMsg();
				}
			}
		}
	});

	$(document).on("click", ".long", function() {
		$(this).toggleClass("active").scrollTop(0);
	});

	$(document).on("click", ".chat-more", function() {
		lace.popover.show({ body: $("#chat-menu").html(), origin: $(this) });
	});
});
