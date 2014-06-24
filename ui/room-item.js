/* jshint browser: true */
/* global $, libsb */

var roomEl = {};
var roomName = "";
var $template = $(".room-item").eq(0);

roomEl.render = function (el, room, index) {
	el = el || $template.clone(false);
	el.find(".room-name").text(room);
	el.find(".unread").addClass("hidden");
	el.attr('id', 'room-item-' + room);
	el.data('index', index);
	if(roomName == room) {
		$(".room-item.current").removeClass("current");
		el.addClass("current");
	}
	return el;
};
window.roomEl = roomEl;


libsb.on('navigate', function(state, next) {
    if(state.roomName == "pending" && state.room ===null) return next();
    
	if(state.roomName && state.room!== null) {
        roomName = state.roomName;
		$(".room-item.current").removeClass("current");
		$("#room-item-" + state.roomName).addClass("current");
	}
	
    next();
}, 500);
