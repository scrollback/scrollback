/* jshint browser: true */
/* global $, libsb */

var roomEl = {};

$(function() {
	var $template = $(".roomitem").eq(0);
	
	roomEl.render = function (el, room, index) {
		el = el || $template.clone(false);

		el.find(".name").text(room);
		el.find(".unread").addClass("hidden");
		el.attr('id', 'roomitem-' + room);
		el.data('index', index);
		
		return el;
	};
});

libsb.on('navigate', function(state, next) {
	if(state.room && state.old && state.room != state.old.room) {
		$(".roomitem.current").removeClass("current");
		$("#roomitem-" + state.room).addClass("current");
	}
	next();
});