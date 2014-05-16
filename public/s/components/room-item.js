/* jshint browser: true */
/* global $, libsb */

var roomEl = {};

var $template = $(".room-item").eq(0);

roomEl.render = function (el, room, index) {
	el = el || $template.clone(false);

	el.find(".room-name").text(room);
	el.find(".unread").addClass("hidden");
	el.attr('id', 'room-item-' + room);
	el.data('index', index);

	return el;
};
window.roomEl = roomEl;


libsb.on('navigate', function(state, next) {
	if(state.room && state.old && state.room != state.old.room) {
		$(".room-item.current").removeClass("current");
		$("#room-item-" + state.room).addClass("current");
	}
	next();
});
