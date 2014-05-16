/* jshint browser: true */
/* global $, format, lace */

var textEl = {},
	timeBefore;

function setEndOfContenteditable(contentEditableElement)
{
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection)//IE 8 and lower
    {
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
}

$(function() {
	var $template = $(".chat-item").eq(0);

	textEl.render = function (el, text) {
		el = el || $template.clone(false);
		el.find('.chat-nick').text(text.from);
		el.find('.chat-message').html(format.linkify(format.textToHtml(text.text)));
		el.find('.chat-timestamp').html(format.friendlyTime(text.time, new Date().getTime()));
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

		if (msg.indexOf(nick) < 0) {
			msg = msg + " @" + nick + "&nbsp;";
		}

		$(".chat-entry").html(msg).focus();
		setEndOfContenteditable($('.chat-entry').get(0));
		$(".chat-entry").on("click", function() {
			$(".chat-item").removeClass("current");
		});
	});

	$(document).on("click", ".chat-more", function() {
		lace.popover.show($(this), $("#chat-menu").html());
	});
});

window.textEl = textEl;
