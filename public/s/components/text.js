/* jshint browser: true */
/* global $, format, lace */

var textEl = {},
	timeBefore;

$(function() {
	var $template = $(".chat").eq(0);

	textEl.render = function (el, text) {
		el = el || $template.clone(false);
		el.find('.nick').text(text.from);
		el.find('.message').html(format.linkify(format.textToHtml(text.text)));
		el.find('.timestamp').html(format.friendlyTime(text.time, new Date().getTime()));
		el.data('index', text.time);

		if (timeBefore) {
			if (Math.abs(text.time - timeBefore) > 300000) {
				el.addClass("timestamp-displayed");
			}
		}

		timeBefore = text.time;

		if (text.text.length >= 400) {
			el.addClass("long");
		}

		if (text.threads && text.threads.length) {
			el.addClass('conv-' + text.threads[0].id.substr(-1));
		}

		return el;
	};

	// Expand long messages
	$(document).on("click", ".long", function() {
		$(this).toggleClass("active").scrollTop(0);
	});

	$(document).on("click", ".chat", function() {
		var classes = $("body").attr('class').replace(/conv-\d+/g, '');

		$("body").attr('class', classes);

		$(this).attr("class").split(" ").forEach(function(s) {
			var conv = s.match(/^conv-\d+$/);

			if (conv) {
				$("body").addClass(conv[0]);
			}
		});

		$(".chat").not(this).removeClass("current");
		$(this).addClass("current");

		var nick = $(this).children(".nick").text(),
			msg = $(".chat-entry").text().replace(/@\S+[\s+{1}]?$/, "");

		if (msg.indexOf(nick) < 0) {
			msg = msg + " @" + nick + "&nbsp;";
		}

		$(".chat-entry").html(msg).focus();

		$(".chat-entry").on("click", function() {
			$(".chat").removeClass("current");
		});
	});

	$(document).on("click", ".chat-more", function() {
		lace.popover.show($(this), $("#chat-menu").html());
	});
});

window.textEl = textEl;
