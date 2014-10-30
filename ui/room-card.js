/* jshint browser: true */
/* global $ */

var roomCard = {},
	$template = $(".card-item-wrap").eq(0);

roomCard.render = function($el, room, online, index) {
	var $card;

	if (!room) {
		return;
	}

	$el = $el || $template.clone(false);

	$el.attr("data-index", index);

	$card = $el.find(".card-item");

	$card.attr("id", "room-card-" + room.id);
	$card.attr("data-room", room.id);

	$card.find(".card-header-title").text(room.id);
	$card.find(".card-content-summary").text(room.description || "This room has no description.");
	//	$card.find(".card-actions-online").text(online);

	return $el;
};

module.exports = roomCard;
