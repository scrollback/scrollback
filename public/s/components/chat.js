/* jshint browser: true */
/* global $, format */

var chatEl = {},
	timeBefore;

$(function() {
	var $template = $(".chat-item").eq(0);

	chatEl.render = function (el, text) {
		el = el || $template.clone(false);
		if(text.labels && text.labels["action"]) el.addClass("chat-label-action");
		el.find('.chat-nick').text(text.from);
		el.find('.chat-message').html(format.linkify(format.textToHtml(text.text || "")));
		el.find('.chat-timestamp').text(format.friendlyTime(text.time, new Date().getTime()));
		el.data('index', text.time);
		el.attr("id", text.id);

		if (timeBefore) {
			if ((text.time - timeBefore) > 180000) {
				el.addClass("timestamp-displayed");
			}
		}

		timeBefore = text.time;

		if (text.text && text.text.length >= 400) {
			el.addClass("long");
		}

		if (text.threads && text.threads.length) {
			el.addClass('conv-' + text.threads[0].id.substr(-1));
		}

		return el;
	};
});

window.chatEl = chatEl;
