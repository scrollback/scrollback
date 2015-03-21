/* jshint browser: true */
/* global $ */

var stringUtils = require("../lib/string-utils.js"),
	roomCard = {},
	$template = $(".card-item-wrap").eq(0);

function getHashCode(str) {
	var hash = stringUtils.hashCode(str);

	if (hash < 0) {
		hash = hash >>> 1;
	}

	return hash % 10;
}

roomCard.render = function(roomObj, $el) {
	var $card,
		roomName;

	$el = $el || $template.clone(false);

	if (!(roomObj && roomObj.id)) {
		return;
	}

	roomName = roomObj.id;

	$el = $el || $template.clone(false);

	$el.addClass("color-" + getHashCode(roomName));

	$card = $el.find(".card-item");

	$card.attr("data-room", roomName);
	$card.find(".card-header-title").text(roomName);
	$card.find(".card-content-summary").text(roomObj.description || "This room has no description.");

	return $el;
};

module.exports = roomCard;
