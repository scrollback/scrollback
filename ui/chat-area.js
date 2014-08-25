/* jslint browser: true, indent: 4, regexp: true*/
/* global $, libsb, currentState, format */

var chatEl = require("./chat.js"),
	chatArea = {};

function getIdAndTime(index) {
	var time, id;
	if (!index) return {
		time: null,
		id: ""
	};

	index = index.split("-");
	time = index[0];
	id = index[1];

	time = parseInt(time) || null;
	return {
		time: time,
		id: id
	};
}

function returnArray(query, index) {
	var texts = query.results,
		rIndex = -1,
		i, inc, end;
	texts = texts.slice(0, texts.length);
	if (query.time) {
		if (query.before) {
			i = texts.length - 1;
			inc = -1;
			end = 0;
		} else if (query.after) {
			end = texts.length - 1;
			inc = 1;
			i = 0;
		}
		while (i != end) {
			if (texts[i].type == "missing") {
				if (texts[i].endTime == index.time || texts[i].startTime == index.time) {
					rIndex = i;
					break;
				}
			} else if (texts[i].type == "text") {
				if (texts[i].id == index.id) {
					rIndex = i;
					break;
				}
				if (texts[i].time != index.time) break;

			}
			i+=inc;
		}
	}
	if (rIndex >= 0) texts.splice(rIndex, 1);
	return texts;
}

$(function () {
	var $logs = $(".chat-area"),
		roomName = "",
		thread = '',
		time = null;
	function resetLog(time){
		$logs.reset(time+"-" || null);
	}
	$logs.infinite({
		scrollSpace: 2000,
		fillSpace: 1000,
		itemHeight: 50,
		startIndex: time,
		getItems: function (index, before, after, recycle, callback) {
			var query = {
				to: roomName,
				before: before,
				after: after
			};
			if (!roomName) return callback([]);

			index = getIdAndTime(index);

			query.time = index.time;
			if (index.id && index.id !== "missing") {
				if (query.before) query.before++;
				else if (query.before) query.after++;
			}

			if (thread) query.thread = thread;
			if (!index.time && !before) return callback([false]);

			function loadTexts() {
				libsb.getTexts(query, function (err, t) {
					var texts = t.results || [];
					if (err) throw err; // TODO: handle the error properly.

					if (!index && t.results.length === 0) {
						return callback([false]);
					}

					texts = returnArray(query, index);
					if (after === 0) {
						if (texts.length < before) {
							texts.unshift(false);
						}
					} else if (before === 0) {
						if (texts.length < after) {
							texts.push(false);
						}
					}

					callback(texts.map(function (text) {
						return text && chatEl.render(null, text);
					}));
				});
			}

			loadTexts();
		}
	});

	// Insert incoming text messages.
	libsb.on("text-dn", function (text, next) {
		var $oldEl = $("#chat-" + text.id),
			$newEl = chatEl.render(null, text);

		if (text.to !== window.currentState.roomName) return next();

		if (text.threads && text.threads.length && window.currentState.thread) {
			for (var i = 0; i < text.threads.length; i++) {
				if (text.threads[i].id == window.currentState.thread) {
					break;
				}
			}

			if (i >= text.threads.length) return next();
		} else if (window.currentState.thread) {
			return next();
		}

		if ($oldEl.length) {
			$oldEl.remove();
		}

		if ($logs.data("lower-limit")) {
			$logs.addBelow($newEl);

			$newEl.get(0).scrollIntoView(true);
		}

		next();
	}, 100);

	libsb.on("text-up", function (text, next) {
		libsb.getOccupants(window.currentState.roomName, function (err, data) {
			var occupants = [];

			if (data.results && data.results.length) {
				for (var i in data.results) {
					occupants.push(data.results[i].id);
				}
			}

			function isMention(input) {
				if ((/^@[a-z][a-z0-9\_\-\(\)]{2,32}[:,]?$/i).test(input) || (/^[a-z][a-z0-9\_\-\(\)]{2,32}:$/i).test(input)) {
					input = input.replace(/[@:,]/g, "").toLowerCase();

					if (occupants.indexOf("guest-" + input) > -1) {
						text.mentions.push("guest-" + input);
					} else {
						text.mentions.push(input);
					}
				}
			}

			text.mentions = [];
			text.text.split(" ").map(isMention);
		});

		if ($logs.data("lower-limit")) {
			var $newEl = chatEl.render(null, text);

			$logs.addBelow($newEl);

			$newEl.get(0).scrollIntoView(true);
		}

		next();
	}, 90);
	libsb.on("init-dn", function (init, next) {
		resetLog(time || null);
		next();
	}, 100);
	libsb.on("navigate", function (state, next) {
		var reset = false;

		if (state.source == 'chat-area') return next();
		if (state.source == "boot") {
			roomName = state.roomName || currentState.roomName;
			thread = state.thread || currentState.thread;
			time = state.time || (state.thread ? 1 : time);
			reset = true;
		} else {
			if (state.roomName && state.room === null) {
				reset = true;
				roomName = currentState.roomName;
			} else if (state.roomName && state.roomName !== state.old.roomName) {
				roomName = state.roomName;
				reset = true;
			}

			if (state.old && state.time != state.old.time) {
				time = state.time;
				reset = true;
			}

			if (typeof state.thread != "undefined" && state.old && state.thread != state.old.thread) {
				thread = state.thread;
				time = thread ? 1 : null;
				reset = true;
			}
			if (/^conf-/.test(state.source)) {
				reset = true;
			}
		}
		if (reset) {
			resetLog(time);
		}

		next();
	}, 200);

	// The chatArea API.
	chatArea.getPosition = function () {
		var pos = $logs[0].scrollHeight - ($logs.scrollTop() + $logs.height());

		if (!this.value) {
			this.value = pos;
		}

		return pos;
	};

	chatArea.setPosition = function (bottom) {
		$logs.css({
			bottom: bottom
		});

		if (chatArea.getPosition.value === 0) {
			$logs.scrollTop($logs[0].scrollHeight);
		}
	};

	chatArea.setRoom = function (r) {
		roomName = r;
		$logs.find(".chat").remove();
		$logs.scroll();
	};

	var timeout,
		top = $(this).scrollTop();

	$logs.on("scroll", function () {

		var cur_top = $logs.scrollTop();

		if (top < cur_top) {
			$("body").removeClass("scroll-up").addClass("scroll-down");
		} else {
			$("body").removeClass("scroll-down").addClass("scroll-up");
		}

		top = cur_top;

		$("body").addClass("scrolling");

		if (timeout) clearTimeout(timeout);

		timeout = setTimeout(function () {
			$("body").removeClass("scrolling").removeClass("scroll-up").removeClass("scroll-down");
			timeout = 0;
		}, 1000);

		var chats = $logs.find(".chat-item"),
			time = getIdAndTime(chats.eq(0).data("index")).time,
			parentOffset = $logs.offset().top;
		
		for (var i = 0; i < chats.length; i++) {
			if (chats.eq(i).offset().top - parentOffset > 0) {
				time = getIdAndTime(chats.eq(i).data("index")).time;
				break;
			}
		}

		chatArea.getPosition.value = chatArea.getPosition();

		if (chatArea.getPosition.value === 0) {
			time = null;
		}

		libsb.emit('navigate', {
			time: time,
			source: 'chat-area'
		});
	});

	libsb.on("navigate", function (state, next) {
		if (state.old && state.time !== state.old.time) {
			if (state.time) {
				$(".chat-position").text(format.friendlyTime(state.time, new Date().getTime()));
			}
		}

		next();
	}, 50);

	setInterval(function () {
		$(".chat-timestamp").each(function () {
			var time = getIdAndTime($(this).parent().data("index")).time;

			$(this).empty().text(format.friendlyTime(time, new Date().getTime()));
		});
	}, 60000);
});

module.exports = chatArea;