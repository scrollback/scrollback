/* jshint browser: true */
/* global $, libsb, lace */

$(function() {
	$(document).on("click", ".long", function() {
		$(this).toggleClass("active").scrollTop(0);
	});

	$(document).on("click", ".chat-item, .thread-item", function() {
		var classes = $("body").attr('class').replace(/conv-\d+/g, '');

		$("body").attr('class', classes);

		$(this).attr("class").split(" ").forEach(function(s) {
			var conv = s.match(/^conv-\d+$/);

			if (conv) {
				$("body").addClass(conv[0]);
			}
		});

		$(".chat-item").not(this).removeClass("current");

		$(this).addClass("current");

		var nick = $(this).children(".chat-nick").text(),
			msg = $(".chat-entry").text().replace(/@\S+[\s+{1}]?$/, "");

		if (msg.indexOf(nick) < 0 && libsb.user.id !== nick) {
			msg = msg + " @" + nick + "&nbsp;";
		}

		$(".chat-entry").html(msg).focus();

		if ($.fn.setCursorEnd) {
			$(".chat-entry").setCursorEnd();
		}

		$(".chat-entry").on("click", function() {
			$(".chat-item").removeClass("current");
		});
	});

	$(document).on("click", ".chat-more", function() {
		lace.popover.show({ body: $("#chat-menu").html(), origin: $(this) });
	});

	$(document).on("keydown", function(e){
		if ($(".chat-item.current").length > 0) {
			var $chat = $(".chat-item.current"),
				$el;

			if (e.keyCode === 38 && $chat.prev().length > 0) {
				e.preventDefault();
				$el = $chat.prev();
			} else if (e.keyCode === 40 && $chat.next().length > 0) {
				e.preventDefault();
				$el = $chat.next();
			}

			if ($el && (e.keyCode === 38 || e.keyCode === 40)) {
				$el[0].scrollIntoView(true);
				$el.click().addClass("clicked");

				setTimeout(function() {
					$el.removeClass("clicked");
				}, 500);
			}
		}
	});

	$(document).on('DOMNodeInserted', function(e) {
		if ($(e.target).hasClass("chat-item") && $.fn.oembed) {
			$(e.target).find("a.oembed").oembed();
		}
	});
});
