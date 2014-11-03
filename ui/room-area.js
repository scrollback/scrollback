/* jshint browser: true */
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
	var roomCard = require("./room-card.js"),
		roomItem = require("./room-item.js"),
		rooms = require("./rooms"),
		roomList = rooms(".js-area-rooms", roomItem.render, "room-item"),
		homeFeedFeatured = rooms(".js-area-home-feed-featured", roomCard.render, "room-card-featured"),
		homeFeedMine = rooms(".js-area-home-feed-mine", roomCard.render, "room-card-mine"),
		$roomHeader = $(".room-header"),
		$gotoform = $("#home-go-to-room-form"),
		$gotoentry = $("#home-go-to-room-entry"),
		roomArea = {
			add: function(roomObj) {
				if (window.currentState.mode === "home") {
					homeFeedMine.add(roomObj);
				} else if (!(window.currentState.embed && window.currentState.embed.form)) {
					roomList.add(roomObj);
				}
			},

			remove: function(roomObj) {
				if (window.currentState.mode === "home") {
					homeFeedMine.remove(roomObj);
				} else if (!(window.currentState.embed && window.currentState.embed.form)) {
					roomList.remove(roomObj);
				}
			},

			empty: function() {
				roomList.empty();
				homeFeedMine.empty();
			}
		};

	function setCurrentRoom(room) {
		$("[data-room]").removeClass("current");
		$("[data-room=" + room + "]").addClass("current");
	}

	function updateFeaturedRooms() {
		homeFeedFeatured.empty();

		libsb.emit("getRooms", { featured: true }, function(err, response) {
			if (!(response && response.results && response.results.length)) {
				return;
			}

			for (var i = 0, l = response.results.length; i < l; i++) {
				homeFeedFeatured.add(response.results[i]);
			}
		});
	}

	function updateMyRooms() {
		var room = window.currentState.roomName;

		if (window.currentState.mode !== "normal" && window.currentState.mode !== "home") {
			return;
		}

		roomArea.empty();

		if (room) {
			libsb.emit("getRooms", { ref: room }, function(err, response) {
				if (!(response && response.results && response.results.length)) {
					return;
				}

				roomArea.add(response.results[0]);
			});
		}

		if (libsb.occupantOf) {
			libsb.occupantOf.forEach(function(roomObj) {
				roomArea.add(roomObj);
			});
		}

		if (libsb.memberOf) {
			libsb.memberOf.forEach(function(roomObj) {
				roomArea.add(roomObj);
			});
		}

		setCurrentRoom(room);
	}

	libsb.on("navigate", function(state, next) {
		if (state.old) {
			if ((state.old.connectionStatus !== state.connectionStatus) ||
				(state.old.roomName !== state.roomName && state.source !== "room-area") ||
				(state.old.mode !== state.mode)) {
				updateMyRooms();
				updateFeaturedRooms();
			}
		}

		next();
	}, 500);

	libsb.on("init-dn", function(init, next) {
		updateMyRooms();
		updateFeaturedRooms();
		next();
	}, 500);

	$(document).on("click", function(e) {
		var $el = $(e.target).closest("[data-room]"),
			room = $el.attr("data-room");

		if (!$el.length) {
			return;
		}

		setCurrentRoom(room);

		libsb.emit("navigate", {
			roomName: room,
			mode: "normal",
			view: "normal",
			source: "room-area",
			query: null,
			thread: null,
			time: null
		});
	});

	$gotoentry.on("keydown paste", function() {
		$(this).removeClass("error");
	});

	$gotoform.on("submit", function(e) {
		var roomName = $gotoentry.val();

		e.preventDefault();

		if (roomName) {
			libsb.emit("navigate", {
				roomName: roomName.toLowerCase(),
				mode: "normal",
				view: "normal",
				source: "room-list",
				query: null,
				thread: null,
				time: null
			});
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
