/* jshint browser: true */
/* global $, format */

var textEl = {};

$(function() {
	var $template = $(".chat").eq(0);

	textEl.render = function (el, text) {
		el = el || $template.clone(false);
		el.find('.nick').text(text.from);
		el.find('.message').html(format.textToHtml(text.text));
		el.find('.timestamp').html(format.friendlyTime(text.time, new Date().getTime()));
		el.data('index', text.time);

		// TODO: add timestamps, add the 'timestamp-displayed' class, add the 'long' class.

		if(text.threads && text.threads.length)
			el.addClass('conv-' + text.threads[0].id.substr(-1));

		return el;
	};

	// Expand long messages
	$(".long").on("click", function() {
		$(this).toggleClass("active").scrollTop(0);
	});
});

window.textEl = textEl;