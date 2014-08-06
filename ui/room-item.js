/* jshint browser: true */
/* global $ */

var roomEl = {},
	$template = $(".room-item").eq(0);

roomEl.render = function($el, id, index) {
	$el = $el || $template.clone(false);

	$el.find(".room-name").text(id);
	$el.attr("id", "room-item-" + id);
	$el.attr("data-index", index);

	if (window.currentState.roomName === id) {
		$(".room-item.current").removeClass("current");
		$el.addClass("current");
	}

	return $el;
};

module.exports = roomEl;
