/* jshint browser: true */
/* global $, format */

var chatEl = {},
	timeBefore;

$(function() {
	var $template = $(".chat-item").eq(0);

	chatEl.render = function (el, text) {
		el = el || $template.clone(false);
		el.find('.chat-nick').text(text.from);
		el.find('.chat-message').text(format.linkify(text.text));
		el.find('.chat-timestamp').html(format.friendlyTime(text.time, new Date().getTime()));
		el.data('index', text.time);

		if (timeBefore) {
			if ((text.time - timeBefore) > 180000) {
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
});

window.chatEl = chatEl;
