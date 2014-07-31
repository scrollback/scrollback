/* jslint browser: true, indent: 4, regexp: true*/
/* global $, libsb, currentState, format */

var chatEl = require("./chat.js"),
	chatArea = {};

$(function () {
	var $logs = $(".chat-area"),
		roomName = "",
		thread = '',
		time = null;
	window.logs = $logs;
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
			console.log("CHAT-AREAGetItems fired.", index, before, after);
			if (!roomName) return callback([]);

			index = index || time;
			query.time = index;
			console.log("GetItems fired.", index, before, after);

            if(thread) query.thread = thread;
            if(!index && !before) return callback([false]);
			console.log("GetItems fired.", index, before, after);
			
			function loadTexts() {
				libsb.getTexts(query, function (err, t) {
                    var texts = t.results || [];
					console.log("GetItems fired.", index, before, after, t);
					texts = texts.slice(0, texts.length, currentState);
                    
					if (err) throw err; // TODO: handle the error properly.

					if (!index && texts.length === "0") {
						return callback([false]);
					}

					if (after === 0) {
						if (texts.length < before) {
							texts.unshift(false);
						}

                        if(t.time && texts.length && texts[texts.length-1].time === t.time) {
                            texts.pop();
                        }
					} else if (before === 0) {
						if (texts.length < after) {
							texts.push(false);
						}
                        if(texts.length && texts[0].time == t.time) {
                            texts.splice(0, 1);
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

            if(i >= text.threads.length) return next();
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
		libsb.getOccupants(window.currentState.roomName, function(err, data) {
			var occupants = [];

			if (data.results && data.results.length) {
				for (var i in data.results) {
					occupants.push(data.results[i].id);
				}
			}

			function isMention(input) {
				if ((/^@[a-z][a-z0-9\_\-\(\)]{2,32}[:,]?$/i).test(input) || (/^[a-z][a-z0-9\_\-\(\)]{2,32}:$/i).test(input)) {
					input = input.replace(/[@:,]/g,"").toLowerCase();

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
	libsb.on("init-dn", function(init, next) {
		if(time === null) $logs.reset();
		
		next();
	}, 100);
	libsb.on("navigate", function (state, next) {
		var reset = false;
		console.log("CHAT-AREA", state);

		if (state.source == 'chat-area') return next();
		if (state.source == "init") {
			roomName = state.roomName || currentState.roomName;
			thread = state.thread || currentState.thread;
			time = state.time || (state.thread? 1: time);
			reset = true;
		}else {
            if(state.roomName && state.room === null) {
                reset = true;
                roomName = currentState.roomName;
            }else if(state.roomName && state.roomName !== state.old.roomName) {
				roomName = state.roomName;
				reset = true;
			}

			if (state.old && state.time != state.old.time) {
				time = state.time;
				reset = true;
			}

			if (typeof state.thread != "undefined" && state.old && state.thread != state.old.thread) {
				thread = state.thread;
                time = thread? 1:null;
				reset = true;
			}
            if(/^conf-/.test(state.source)) {
                reset = true;
            }
		}
		if (reset) {
			$logs.reset(time);
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
			time = chats.eq(0).data("index"),
			parentOffset = $logs.offset().top;

		for (var i = 0; i < chats.length; i++) {
			if (chats.eq(i).offset().top - parentOffset > 0) {
				time = chats.eq(i).data("index");
				break;
			}
		}

		chatArea.getPosition.value = chatArea.getPosition();

		if (chatArea.getPosition.value === 0) {
			time = null;
		}

        libsb.emit('navigate', { time: time, source: 'chat-area' });
	});

	libsb.on("navigate", function(state, next) {
		if (state.old && state.time !== state.old.time) {
			if (state.time) {
				$(".chat-position").text(format.friendlyTime(state.time, new Date().getTime()));
			}
		}

		next();
	}, 50);

	setInterval(function() {
		$(".chat-timestamp").each(function() {
			var time = $(this).parent().data("index");

			$(this).empty().text(format.friendlyTime(time, new Date().getTime()));
		});
	}, 60000);

	$(document).on("click", ".chat-item-long", function() {
		$(this).toggleClass("expanded").scrollTop(0);
	});
});

module.exports = chatArea;
