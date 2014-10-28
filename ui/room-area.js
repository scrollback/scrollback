/* jshint browser: true */
/* global $, libsb */

$(function() {
	var roomCard = require("./room-card.js"),
		roomItem = require("./room-item.js"),
		rooms = require("./rooms"),
		roomList = rooms(".js-area-rooms", roomItem.render),
		homeFeedFeatured = rooms(".js-area-home-feed-featured", roomCard.render),
		homeFeedMine = rooms(".js-area-home-feed-mine", roomCard.render),
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

		$(".room-item.current").removeClass("current");

		if (room) {
			libsb.emit("getRooms", { ref: room }, function(err, response) {
				if (!(response && response.results && response.results.length)) {
					return;
				}

				roomArea.add(response.results[0]);

				$("#room-item-" + room).addClass("current");
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
	}

	libsb.on("navigate", function(state, next) {
		if (state.old) {
			if ((state.old.connectionStatus !== state.connectionStatus) ||
				(state.old.roomName !== state.roomName) ||
				((state.old.mode !== state.mode))) {
				updateMyRooms();
			}
		}

		next();
	}, 500);

	libsb.on("init-dn", function(init, next) {
		updateFeaturedRooms();
		updateMyRooms();

		next();
	}, 500);

	$(document).on("click", function(e) {
		var $el = $(e.target).closest(".room-item");

		if (!$el.length) {
			return;
		}

		libsb.emit("navigate", {
			roomName: $el.attr("id").replace(/^room-item-/, ""),
			mode: "normal",
			view: "normal",
			source: "room-area",
			query: null,
			thread: null,
			time: null
		});
	});
});
