/* jslint browser: true, indent: 4, regexp: true */
/* global $ */

$(function() {
	var $cardContainer = $(".card-container");

	function setCard(cardObj) {
		var attrs = [],
			events = [],
			segments = [],
			$card;

		if (!cardObj) {
			return;
		}

		cardObj.id = cardObj.id || "card-" + new Date().getTime();

		$card = $("<div>").attr("id", cardObj.id);

		for (var i in cardObj) {
			if (typeof cardObj[i] === "string") {
				attrs.push(i);
			} else if ((/^on/).test(i) && typeof cardObj[i] === "function") {
				events.push(i);
			} else if (typeof cardObj[i] === "object") {
				segments.push(i);
			}
		}

		attrs.forEach(function(attr) {
			if (attr === "className") {
				$card.removeClass().addClass("card-item " + cardObj[attr]);
			} else {
				$card.attr(attr, cardObj[attr]);
			}
		});

		events.forEach(function(event) {
			$card.on(event.replace(/^on/, ""), cardObj[event]);
		});

		segments.forEach(function(segment) {
			var $segment;

			if (cardObj[segment]) {
				$segment = $card.find(".card-" + segment);

				if (!($segment.length)) {
					$segment = $("<div>").addClass("card-segment card-" + segment);
					$segment.appendTo($card);
				}

				for (var item in cardObj[segment]) {
					var className = "card-" + segment + "-" + item,
						$oldel = $segment.find("." + className),
						$newel = $("<div>").addClass(className).html(cardObj[segment][item]);

					if ($oldel.length) {
						$oldel.replaceWith($newel);
					} else {
						$newel.appendTo($segment);
					}
				}
			}
		});

		return $card;
	}

	function updateCard(cardObj) {
		var $oldCard, $newCard;

		if (!(cardObj && $cardContainer.length)) {
			return;
		}

		$newCard = setCard(cardObj);

		if (cardObj.id) {
			$oldCard = $("#" + cardObj.id);
		}

		if ($oldCard && $oldCard.length && $oldCard.hasClass("card-item")) {
			$oldCard.replaceWith($newCard);
		} else {
			$cardContainer.append($("<div class='card-item-wrap'></div>").append($newCard));
		}

		return $newCard;
	}

	function randomStr(n) {
		var str = (Math.random() + 1).toString(36).substring(2, (n + 2));

		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	for (var i = 0; i < 20; i++) {
		updateCard({
			id: randomStr(5),
			className: "conv-" + Math.floor(Math.random() * 10),
			onclick: function() { console.log("hi"); },
			header: {
				title: randomStr(7),
				badge: Math.round(Math.random() * 100)
			},
			content: {
				title: randomStr(15),
				summary: randomStr(80)
			},
			actions: {
				view: "View conversation",
				online: "<span class='card-actions-online-number'>124</span> people talking"
			}
		});
	}
});
