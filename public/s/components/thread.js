/* jshint browser: true */
/* global $, format, libsb */

var threadEl = {};

$(function() {
	var $template = $(".thread").eq(0);

	threadEl.render = function (el, thread) {
		el = el || $template.clone(false);
		
		el.find('.title').text(thread.title);
		el.find('.snippet').html("");
		el.find('.timestamp').html(format.friendlyTime(thread.startTime, new Date().getTime()));
		el.attr('id', 'thread-' + thread.id);
		el.data('index', thread.startTime);
		
		el.addClass('conv-' + thread.id.substr(-1));
		// TODO: add thread class (for color);
		
		return el;
	};
});

libsb.on('navigate', function(state, next) {
	if(state.thread && state.thread != state.old.thread) {
		$(".thread.current").removeClass("current");
		$("#thread-" + state.thread).addClass("current");
	}
	next();
});