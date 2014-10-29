/* jshint browser: true */
/* global $ */

var roomCard = {},
	$template = $(".card-item-wrap").eq(0);

roomCard.render = function(roomObj, $el) {
	var $card;

	$el = $el || $template.clone(false);

	if (!(roomObj && roomObj.id)) {
		return;
	}

	$el = $el || $template.clone(false);

	$card = $el.find(".card-item");

	$card.attr("data-room", roomObj.id);

	$card.find(".card-header-title").text(roomObj.id);
	$card.find(".card-content-summary").text(roomObj.description || "This room has no description.");

	return $el;
};

module.exports = roomCard;
