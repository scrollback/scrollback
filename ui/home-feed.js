/* jslint browser: true, indent: 4, regexp: true */
/* global $, libsb */

$(function() {
	var $cardContainer = $(".card-container"),
		$gotoform = $("#home-go-to-room-form"),
		$gotoentry = $("#home-go-to-room-entry"),
		$template = $(".card-item-wrap").eq(0),
		roomCard = {},
		goToRoom = function(roomName) {
			if (!roomName) {
				return;
			}

			libsb.emit("navigate", {
				roomName: roomName,
				mode: "normal",
				view: "normal",
				source: "room-list",
				query: null,
				thread: null,
				time: null
			});
		};

	roomCard.render = function($el, room, online, index) {
		var $card;

		if (!room) {
			return;
		}

		$el = $el || $template.clone(false);

		$card = $el.find(".card-item");

		$card.attr("id", "room-card-" + room.id);
		$card.attr("data-room", room.id);
		$card.attr("data-index", index);

		$card.find(".card-header").text(room.id);
		$card.find(".card-content-summary").text(room.description || "This room has no description.");
		$card.find(".card-actions-online").text(online);

		return $el;
	};

	$cardContainer.on("click", function(e) {
		var $card = $(e.target).closest(".card-item");

		if (!$card.length) {
			return;
		}

		goToRoom($card.data("room-name"));
	});

	libsb.on("navigate", function(state, next) {
		if (state.old && state.mode !== state.old.mode) {
			if (state.mode === "home") {
				// render rooms
			} else {
//				$cardContainer.empty();
			}
		}

		next();
	}, 500);

	$gotoform.on("submit", function(e) {
		var roomName = $gotoentry.val();

		e.preventDefault();

		if (roomName) {
			goToRoom(roomName);
		} else {
			$gotoentry.addClass("error").focus();
		}
	});

	$gotoentry.on("keydown paste", function() {
		$(this).removeClass("error");
	});
});
