/* jshint browser: true */
/* global $, libsb, lace */

function setCursorEnd(el) {
	var range, selection;

	if (document.createRange) {
		range = document.createRange();
		range.selectNodeContents(el);
		range.collapse(false);
		selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	} else if (document.selection) {
		range = document.body.createTextRange();
		range.moveToElementText(el);
		range.collapse(false);
		range.select();
	}
}

$(function() {
	$(document).on("click", ".long", function() {
		$(this).toggleClass("active").scrollTop(0);
	});

	$(document).on("click", ".chat-item", function() {
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
		setCursorEnd($('.chat-entry').get(0));
		$(".chat-entry").on("click", function() {
			$(".chat-item").removeClass("current");
		});
	});

	$(document).on("click", ".chat-more", function() {
		lace.popover.show($(this), $("#chat-menu").html());
	});

	$(document).on("keydown", function(e){
		if ($(".chat-item.current").length > 0) {
			var $chat = $(".chat-item.current");

			if (e.keyCode === 38 && $chat.prev().length > 0) {
				$chat.prev()[0].scrollIntoView(true);
				$chat.prev().click();
			} else if (e.keyCode === 40 && $chat.next().length > 0) {
				$chat.next()[0].scrollIntoView(true);
				$chat.next().click();
			}
		}
	});
});
