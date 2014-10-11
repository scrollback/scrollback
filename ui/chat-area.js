/* jslint browser: true, indent: 4, regexp: true*/
/* global $, libsb, currentState, format */

var chatEl = require("./chat.js"),
	_ = require('underscore'),
	chatArea = {}, scrollTimer = null, time, firstTime = false;;

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


function loadNewText(room, time, cb, results) {
	if(!results) results = [];
	libsb.getTexts({to: room, updateTime: time, after: 255}, function(err, query) {
		var res = query.results;
		res = res.slice(1);
		results = results.concat(res);
		if(query.results.length >=255) return loadNewText(room, query.results[query.results.length-1].time, cb, results);
		cb(results);
	});
}

function returnArray(query, index) {
	var texts = query.results,
		rIndex = -1,
		i, inc, end;
	texts = texts.slice(0, texts.length);
	if(!texts.length) return [];
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
		$chatPosition = $(".chat-position")
		roomName = "",
		thread = '',
		time = null;

	function scrollToBottom($el) {
		if (!($el && $el.length)) {
			return;
		}

		if ($.fn.velocity) {
			$el.children().last().velocity("scroll", { duration: 150, container: $el });
		} else {
			$el.get(0).scrollTop = $logs.get(0).scrollHeight;
		}
	}

	function resetLog(time){
		$logs.reset(time+"-" || null);
	}
	$logs.infinite({
		scrollSpace: 2000,
		fillSpace: 1000,
		itemHeight: 50,
		startIndex: time,
		getItems: function (index, before, after, recycle, callback) {
			var isOwner, query = {
				to: roomName,
				before: before,
				after: after
			};
			
			if (!roomName) return callback([]);
			
			index = getIdAndTime(index);

			query.time = index.time;
			if (index.id && index.id !== "missing") {
				if (query.before) query.before++;
				else if (query.after) query.after++;
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
					callback(_.filter(texts.map(function (text) {
							return text && chatEl.render(null, text, isOwner);
						}), function(m) {
							return typeof m !== "undefined";
					}));
				});
			}

			if (!libsb.user || !libsb.user.id) {
				firstTime = true;
				return callback([false]);
			}

			if(/^guest-/.test(libsb.user.id)) {
				isOwner = false;
				loadTexts();
			}else {
				libsb.emit("getUsers", {memberOf: currentState.roomName, ref: libsb.user.id}, function (e, d) {
					isOwner = (d.results && d.results[0] && d.results[0].role === "owner") ? true : false ;
					loadTexts();
				});
			}

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

			scrollToBottom($logs);
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

			scrollToBottom($logs);
		}

		next();
	}, 90);

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
	
	$logs.on("scroll", function () {

		if(scrollTimer) clearTimeout(scrollTimer);

		scrollTimer = setTimeout(function() {
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
			scrollTimer = null;
			time = time;			
			libsb.emit('navigate', {
				time: time,
				source: 'chat-area'
			}, function(err, state){
				if (state.old && state.time !== state.old.time) {
					if (state.time) {
						$chatPosition.removeClass("hidden").text(format.friendlyTime(state.time, new Date().getTime()));

						setTimeout(function() {
							$chatPosition.addClass("hidden");
						}, 1000);
					}
				}
			});
		}, 500);
	});

	setInterval(function () {
		$(".chat-timestamp").each(function () {
			var time = getIdAndTime($(this).parent().data("index")).time;

			$(this).empty().text(format.friendlyTime(time, new Date().getTime()));
		});
	}, 60000);
	
	libsb.on("back-dn", function(back, next) {
		if(firstTime && back.to === currentState.roomName) {
			resetLog(time);	
			return next();
		}
		
		loadNewText(back.to, null, function(results) {	
			if(back.to === currentState.roomName && results.length) resetLog(time);	
		});
		next();
	}, "watcher");
});

module.exports = chatArea;
