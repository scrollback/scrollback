/* jshint browser: true */
/* global $, libsb, currentState */

var validate = require("../lib/validate.js"),
	roomCard = require("./room-card.js"),
	roomEl = require("./room-item.js"),
	$roomarea, $homefeed,
	rooms = [],
	roomObjs = {},
	listenQueue = [],
	listening = {},
	BACK_SENT = 1,
	BACK_RECEIVED = 2,
	NOT_LISTENING = 0;

function enter(room) {
	var roomName;

	if (!(room && room.id)) {
		return;
	}

	roomName = room.id.toLowerCase();

	if (rooms.indexOf(roomName) < 0) {
		rooms.push(roomName);
		roomObjs[roomName] = room;
	}

	if (currentState.connectionStatus == "online") {
		if (!listening[roomName]) {
			listening[roomName] = BACK_SENT;
			libsb.enter(roomName, function(err) {
				var x;

				if (err) {
					listening[roomName] = NOT_LISTENING;
				} else {
					listening[roomName] = BACK_RECEIVED;
				}

				x = listenQueue.indexOf(roomName);

				if (x >= 0) {
					listenQueue.splice(x, 1);
				}
			});
		}
	} else {
		if (listenQueue.indexOf(roomName) < 0) {
			listenQueue.push(roomName);
		}
	}
}

function resetRooms() {
	if (window.currentState.mode !== "home" && $roomarea) {
		$roomarea.reset(0);
	}

	if (window.currentState.mode === "home" && $homefeed) {
		$homefeed.reset(0);
	}
}

$(function() {
	var scrollOpts = {
		scrollSpace: 2000,
		fillSpace: 1000,
		itemHeight: 100,
		startIndex: 0,
		getItems: function(index, before, after, recycle, callback) {
			var res = [],
				i, from, to;

			if (before) {
				if (typeof index === "undefined") {
					return callback([false]);
				}

				from = index - before;
				to = index;
			} else {
				if (typeof index === "undefined" || index < 0) {
					index = 0;
				}

				from = index;
				to = index + after;
			}

			from = (from < 0) ? 0 : from;

			to = (to >= rooms.length) ? rooms.length - 1 : to;

			for (i = from; i <= to; i++) {
				if (typeof rooms[i] !== "undefined") {
					res.push(rooms[i]);
				}
			}

			if (before) {
				if (res.length < before) {
					res.unshift(false);
				}
			} else if (after) {
				if (res.length < after) {
					res.push(false);
				}
			}

			callback(res.map(function(room) {
				if (window.currentState.mode === "home") {
					return room && roomObjs[room] && roomCard.render(null, roomObjs[room], null, rooms.indexOf(room));
				} else {
					return room && roomEl.render(null, room, rooms.indexOf(room));
				}
			}));
		}
	};

	$roomarea = $(".js-area-rooms");
	$homefeed = $(".js-area-home-feed");

	// Set up infinite scroll here.
	$roomarea.infinite(scrollOpts);
	$homefeed.infinite(scrollOpts);

	// Set up a click listener.,
	$roomarea.click(function(event) {
		var $el = $(event.target).closest(".room-item");

		if (!$el.length) {
			return;
		}

		libsb.emit("navigate", {
			roomName: $el.attr("id").replace(/^room-item-/, ""),
			mode: "normal",
			view: "normal",
			source: "room-list",
			query: null,
			thread: null,
			time: null
		});
	});

	// Handle create new room
	$(".js-create-room").on("click", function() {
		var $createRoomDialog = $("<div>").html($("#createroom-dialog").html()).modal(),
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

				$errorMsg = $("<div>").addClass("error").text(error).popover({
					origin: $createRoomEntry
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
							mode: "normal",
							tab: "info",
							time: null
						}, function() {
							location.reload();
						});
					});
				}
			});
		});
	});
});

libsb.on("navigate", function(state, next) {
	var room = state.roomName || "";

	if (window.currentState.embed && window.currentState.embed.form && window.currentState.mode !== "home") {
		return next();
	}

	if (state.source == "boot" || !state.old) {
		if (libsb.memberOf) {
			libsb.memberOf.forEach(function(e) {
				enter(e);
			});
		}
		if (libsb.occupantOf) {
			libsb.occupantOf.forEach(function(r) {
				enter(r);
			});
		}
		if (room) {
			enter({
				id: room
			});
		}
		resetRooms();
	} else if (["home", "normal"].indexOf(state.mode) >= 0 && state.mode != state.old.mode) {
		resetRooms();
	}
	next();
}, 100);

libsb.on("init-dn", function(init, next) {
	if (window.currentState.embed && window.currentState.embed.form && window.currentState !== "home") {
		return next();
	}

	if (init.memberOf) {
		init.memberOf.forEach(function(r) {
			enter(r);
		});
	}

	if (init.occupantOf) {
		init.occupantOf.forEach(function(r) {
			enter(r);
		});
	}

	listenQueue.forEach(function(e) {
		enter({
			id: e
		});
	});

	if (window.currentState.mode !== "home" && $roomarea) {
		$roomarea.reset(0);
	}

	if (window.currentState.mode === "home" && $homefeed) {
		$homefeed.reset(0);
	}

	next();
}, 10);

libsb.on("navigate", function(state, next) {
	if (state.old && state.room !== state.old.room) {
		$(".room-item.current").removeClass("current");

		if (state.roomName) {
			$("#room-item-" + state.roomName).addClass("current");
		}
	}

	if (state.connectionStatus !== "online" && (!state.old || state.old.connectionStatus == "online")) {
		Object.keys(listening).forEach(function(e) {
			listening[e] = NOT_LISTENING;
		});
	} else if (state.connectionStatus == "online" && (!state.old || state.old.connectionStatus != "online")) {
		listenQueue.forEach(function(e) {
			enter({
				id: e
			});
		});
	}
	next();
}, 100);
