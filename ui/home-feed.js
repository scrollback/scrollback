/* jslint browser: true, indent: 4, regexp: true */
/* global $, libsb */

var roomCard = require("./room-card.js");

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
		$featured = $(".js-area-home-feed-featured"),
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

	function renderFeatured() {
		if (window.currentState.mode !== "home" || window.currentState.connectionStatus !== "online") {
			return;
		}

		libsb.emit("getRooms", { featured: true }, function(e, r) {
			var occupantOf = libsb.occupantOf;

			if (r && r.results) {
				$featured.empty();

				r.results.forEach(function(room) {
					for (var i = 0, l = occupantOf.length; i < l; i++) {
						if (occupantOf[i] && occupantOf[i].id === room.id) {
							return;
						}
					}

					$featured.append(roomCard.render(null, room));
				});
			}
		});
	}

	libsb.on("init-dn", function(state, next) {
		renderFeatured();

		next();
	}, 10);

	libsb.on("navigate", function(state, next) {
		if (state && state.old && (state.mode !== state.old.mode || state.connectionStatus !== state.old.connectionStatus)) {
			renderFeatured();
		}

		next();
	}, 10);

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
		var roomName = $gotoentry.val();

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
