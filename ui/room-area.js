/* jshint browser: true */
/* global $, libsb */

var LISTENING = 1,
	NOT_LISTENING = 0,
	WAITING = 2,
	roomsList = {},
	backQueue = [];

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

function enter(id) {
	if (roomsList[id] === LISTENING) {
		return;
	}

	if (window.currentState.connectionStatus == "online") {
		roomsList[id] = LISTENING;

		libsb.enter(id, function(err) {
			var index;

			if (err) {
				roomsList[id] = NOT_LISTENING;
			}

			index = backQueue.indexOf(id);

			if (index >= 0) {
				backQueue.splice(index, 1);
			}
		});
	} else {
		roomsList[id] = WAITING;

		if (backQueue.indexOf(id) < 0) {
			backQueue.push(id);
		}
	}
}

function leave() {
	// Disable leave until the functionality is complete
	// libsb.leave(id);
}

$(function() {
	var validate = require("../lib/validate.js"),
		roomCard = require("./room-card.js"),
		roomItem = require("./room-item.js"),
		rooms = require("./rooms"),
		roomList = rooms(".js-area-rooms", roomItem.render, "room-item"),
		homeFeedFeatured = rooms(".js-area-home-feed-featured", roomCard.render, "room-card-featured"),
		homeFeedMine = rooms(".js-area-home-feed-mine", roomCard.render, "room-card-mine"),
		$roomHeader = $(".room-header"),
		$gotoform = $("#home-go-to-room-form"),
		$gotoentry = $("#home-go-to-room-entry"),
		$createRoomButton = $(".js-create-room"),
		roomArea = {
			add: function(roomObj) {
				var done  = false;

				if (window.currentState.mode === "home") {
					done = homeFeedMine.add(roomObj);
				} else {
					done = roomList.add(roomObj);
				}

				if (done) {
					enter(roomObj.id);
				}
			},

			remove: function(roomObj) {
				var done  = false;

				if (window.currentState.mode === "home") {
					done = homeFeedMine.remove(roomObj);
				} else {
					done = roomList.remove(roomObj);
				}

				if (done) {
					leave(roomObj.id);
				}
			},

			clear: function() {
				var $areas = roomList.container.add(homeFeedMine.container),
					$els = $areas.find("[data-room]");

				for (var i = 0, l = $els.length; i < l; i++) {
					leave($els.eq(i).attr("data-room"));
				}

				return $areas.empty();
			}
		};

	function setCurrentRoom(room) {
		$("[data-room]").removeClass("current");
		$("[data-room=" + room + "]").addClass("current");
	}

	function updateFeaturedRooms() {
		homeFeedFeatured.container.empty();

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

		roomArea.clear();

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

	function createRoom(name) {
		libsb.emit("room-up", {
			to: name,
			room: {
				id: name,
				description: "",
				params: {},
				guides: {}
			}
		}, function() {
			libsb.emit("navigate", {
				roomName: name,
				mode: "conf",
				tab: "embed",
				time: null
			}, function() {
				location.reload();
			});
		});
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

		while (backQueue.length) {
			enter(backQueue[0]);
			backQueue = backQueue.slice(1);
		}

		next();
	}, 500);

	$(document).on("click", "[data-room]", function() {
		var room = $(this).attr("data-room");

		if (!room) {
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

	// Handle create new room
	$createRoomButton.on("click", function() {
		var $createRoomDialog = $("<div>").attr("id", "createroom-modal").html($("#createroom-dialog").html()).modal(),
			$createRoomEntry = $createRoomDialog.find("#createroom-id"),
			$createRoomButton = $createRoomDialog.find("#createroom-save"),
			$errorMsg = $(),
			showError = function(error) {
				if (!error) {
					$createRoomEntry.removeClass("error");
					$errorMsg.popover("dismiss");
					$createRoomDialog.modal("dismiss");

					return;
				}

				$createRoomEntry.addClass("error");

				$errorMsg = $("<div>").addClass("error").append(
					$("<div>").addClass("popover-content").text(error)
				).popover({
					origin: $createRoomEntry
				});

				$(document).off("modalDismissed.createroom").on("modalDismissed.createroom", function(e, modal) {
					if (modal && modal.attr("id") === "createroom-modal") {
						$errorMsg.popover("dismiss");
					}
				});
			};

		$createRoomEntry.on("change input paste", function() {
			$.popover("dismiss");

			$(this).removeClass("error");
		});

		$createRoomDialog.find("#createroom").on("submit", function(e) {
			var name = $createRoomEntry.val(),
				validation = validate(name);

			e.preventDefault();

			if (!validation.isValid) {
				showError(validation.error);

				return;
			}

			$createRoomButton.addClass("loading");

			libsb.emit("getRooms", { ref: name }, function(err, res) {
				$createRoomButton.removeClass("loading");

				if (res && res.results && res.results.length) {
					showError("Another room with same name already exists!");
				} else {
					showError(false);
					createRoom(name);
				}
			});
		});
	});
});
