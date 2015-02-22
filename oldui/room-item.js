/* jshint browser: true */
/* global $ */

var roomEl = {},
	$template = $(".room-item").eq(0);

roomEl.render = function(roomObj, $el) {
	var id = roomObj.id;

	$el = $el || $template.clone(false);

	$el.find(".room-name").text(id);
	$el.attr("data-room", id);

	if (window.currentState.roomName === id) {
		$(".room-item.current").removeClass("current");
		$el.addClass("current");
	}

	return $el;
};

module.exports = roomEl;
