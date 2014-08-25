/* jshint jquery: true */
/* global libsb, currentState */

var roomEl = require("./room-item.js"),
	$roomlist, rooms = [false, false],
	listenQueue = [];
var BACK_SENT = 1, BACK_RECEIVED = 2, NOT_LISTENING = 0;
var listening = {};

function enter(room) {
	if (!room) return;
	room = room.toLowerCase();
	if (rooms.indexOf(room) < 0) {
		rooms.pop();
		rooms.push(room);
		rooms.push(false);
	}

	if (libsb.isInited) {
		if(!listening[room]){
			listening[room] = BACK_SENT;
			libsb.enter(room, function (err) {
				if (err) listening[room] = NOT_LISTENING;
				else listening[room] = BACK_RECEIVED;
			});
		}
	} else {
		if (listenQueue.indexOf(room) < 0) {
			listenQueue.push(room);
		}
	}
	if ($roomlist) $roomlist.reset();
}

module.exports = function (libsb) {
	$(function () {
		$roomlist = $(".room-list");
		// Set up infinite scroll here.
		$roomlist.infinite({
			scrollSpace: 2000,
			fillSpace: 1000,
			itemHeight: 100,
			startIndex: 0,
			getItems: function (index, before, after, recycle, callback) {
				var res = [],
					i, from, to;
				if (!index) {
					index = 0;
				}
				if (before) {
					if (index === 0) {
						return callback([false]);
					}
					index--;
					from = index - before;
					if (from < 0) {
						to = from + before;
						from = 0;
					} else {
						to = index;
					}
				} else {
					if (index) {
						index++;
					} else {
						after++;
					}

					from = index;
					to = index + after;
				}
				for (i = from; i <= to; i++) {
					if (typeof rooms[i] !== "undefined") {
						res.push(rooms[i]);
					}
				}

				callback(res.map(function (r) {
					return r && roomEl.render(null, r, rooms.indexOf(r));
				}));
			}
		});

		// Set up a click listener.,
		$roomlist.click(function (event) {
			var $el = $(event.target).closest(".room-item");

			if (!$el.size()) {
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
	});
	libsb.on("navigate", function (state, next) {
		var room = state.roomName;
		if (currentState.embed && currentState.embed.form) return next();
		if (state.source == "boot") {
			if (libsb.memberOf) {
				libsb.memberOf.forEach(function (e) {
					enter(e.id);
				});
			}
		}
		enter(room);
		next();
	}, 100);

	libsb.on("init-dn", function (init, next) {
		if (currentState.embed && currentState.embed.form) return next();

		if (init.memberOf) {
			init.memberOf.forEach(function (r) {
				enter(r.id);
			});
		}

		listenQueue.forEach(function (e) {
			enter(e);
		});

		listenQueue = [];

		if ($roomlist) {
			$roomlist.reset();
		}

		next();
	}, 10);

	libsb.on("navigate", function (state, next) {
		if (state.old && state.room !== state.old.room) {
			$(".room-item.current").removeClass("current");

			if (state.roomName) {
				$("#room-item-" + state.roomName).addClass("current");
			}
		}

		if (!state.connectionStatus && (!state.old || state.old.connectionStatus)) {
			Object.keys(listening).forEach(function (e) {
				listening[e] = NOT_LISTENING;
			});
		}
		next();
	}, 100);
};