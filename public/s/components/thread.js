/* jshint browser: true */
/* global $, format */

var threadEl = {};

$(function() {
	var $template = $(".thread").eq(0);

	threadEl.render = function (el, thread) {
		el = el || $template.clone(false);
		
		el.find('.title').text(thread.title);
		el.find('.snippet').html("No messages yet.");
		el.find('.timestamp').html(format.friendlyTime(thread.startTime, new Date().getTime()));
		el.data('index', thread.startTime);
		
		el.addClass('conv-' + thread.id.substr(-1));
		// TODO: add thread class (for color);
		
		return el;
	};
});
