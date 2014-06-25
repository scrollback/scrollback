/* jshint browser: true */
/* global $ */

var roomEl = {},
	roomName = "",
	$template = $(".room-item").eq(0);

roomEl.render = function ($el, room, index) {
	$el = $el || $template.clone(false);

	$el.find(".room-name").text(room);
	$el.attr("id", "room-item-" + room);
	$el.data("index", index);

	if(roomName === room) {
		$(".room-item.current").removeClass("current");

		$el.addClass("current");
	}

	return $el;
};

module.exports = roomEl;
