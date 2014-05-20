/* jshint browser: true */
/* global $, format, libsb */

var threadEl = {};

$(function() {
	var $template = $(".thread").eq(0);

	threadEl.render = function (el, thread, index) {
		el = el || $template.clone(false);
		el.find('.thread-title').text(thread.title);
		el.find('.thread-snippet').html("");
		el.find('.timestamp').html(format.friendlyTime(thread.startTime, new Date().getTime()));
		el.attr('id', 'thread-' + thread.id);
		el.data('index', index);
		
		el.addClass('conv-' + thread.id.substr(-1));
		// TODO: add thread class (for color);

		return el;
	};
});

window.threadEl = threadEl;

libsb.on('navigate', function(state, next) {
	if(typeof state.thread != "undefined"  && state.thread != state.old.thread) {
		$(".thread.current").removeClass("current");
		$("#thread-" + state.thread).addClass("current");
	}
	next();
});
