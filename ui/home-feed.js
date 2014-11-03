/* jslint browser: true, indent: 4, regexp: true */
/* global $, libsb */

// Add entry to user menu
libsb.on("user-menu", function(menu, next) {
	if (window.currentState.mode !== "home") {
		menu.items.homefeed = {
			text: "My rooms",
			prio: 100,
			action: function() {
				libsb.emit("navigate", {
					mode: "home",
					view: "normal",
					source: "user-menu"
				});
			}
		};
	}

	next();
}, 1000);

$(function() {
	var $roomHeader = $(".room-header"),
		$cardContainer = $(".card-container"),
		$gotoform = $("#home-go-to-room-form"),
		$gotoentry = $("#home-go-to-room-entry"),
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

	$gotoentry.on("keydown paste", function() {
		$(this).removeClass("error");
	});

	$cardContainer.on("click", function(e) {
		var $card = $(e.target).closest(".card-item");

		if (!$card.length) {
			return;
		}

		goToRoom($card.data("room"));
	});

	$gotoform.on("submit", function(e) {
		var roomName = $gotoentry.val().toLowerCase();

		e.preventDefault();

		if (roomName) {
			goToRoom(roomName);
		} else {
			$gotoentry.addClass("error").focus();
		}
	});

	$roomHeader.on("click", function() {
		libsb.emit("navigate", {
			mode: "home",
			view: "normal",
			source: "room-header"
		});
	});
});
