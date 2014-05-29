/* jslint browser: true, indent: 4, regexp: true*/
/* global $, libsb, chatEl, format */
/* exported chatArea */

var chatArea = {};

$(function() {
	var $logs = $(".chat-area"),
		room = window.location.pathname.split("/")[1], /* replace with room from URL */
		thread = '',
		time = null; /* replace this with the time from the URL, if available. */
	// Set up infinite scroll here.
	$logs.infinite({
		scrollSpace: 2000,
		fillSpace: 500,
		itemHeight: 50,
		startIndex: time,
		getItems: function (index, before, after, recycle, callback) {
			var query = { to: room, time: index || time, before: before, after: after };

			if(thread) query.thread = thread;
			if(!index && !before) return callback([false]);
			if(libsb.isInited) {
				loadTexts();
			}else {
				libsb.on("inited", function(p, n){
					loadTexts(true);
					n();
				});
			}
			function loadTexts() {
				libsb.getTexts(query, function(err, t) {
					var texts = t.results;
					if(err) throw err; // TODO: handle the error properly.

					if(!index && texts.length === "0") {
						return callback([false]);
					}
					if(after === 0) {
						if(texts.length < before) {
							texts.unshift(false);
						}
						if(t.time){
							texts.pop();
						}
					}else if(before === 0) {
						if(texts.length < after) {
							texts.push(false);
						}
						texts.splice(0,1);
					}
					callback(texts.map(function(text) {
						return text && chatEl.render(null, text);
					}));
				});
			}

		}
	});

	// Check for mentions
	libsb.on('text-dn', function(text, next) {
		var people;

		libsb.getMembers(room, function(err, p) {
			if (err) throw err;
			people = p.results;
		});

		function isMember(m) {
			if (people) {
				for (var i=0; i < people.length; i++ ) {
					if (people[i].id === m) {
						return false;
					}
				}
			}

			return true;
		}

		function isMention(input) {
			if ((/^@[a-z][a-z0-9\_\-\(\)]{2,32}[:,]?$/i).test(input) || (/^[a-z][a-z0-9\_\-\(\)]{2,32}:$/i).test(input)) {
				input = input.toLowerCase();
				input = input.replace(/[@:,]/g,"");
				if (isMember(input)) {
					text.mentions.push(input);
				}
			}
		}

		text.text.split(" ").map(isMention);

		next();
	});

	// Insert incoming text messages.
	libsb.on('text-dn', function(text, next) {
		var i = 0, l;

		if(text.resource == libsb.resource) return next();
		if(text.to != room) return next();
		if(text.threads && text.threads.length && thread) {
			for(i=0, l=text.threads.length;i<l;i++) {
				if(text.threads[i].id == thread) {
					break;
				}
			}
			if(i==l){
				return next();
			}
		}else if(thread) {
			return next();
		}

		if($logs.data("lower-limit")) $logs.addBelow(chatEl.render(null, text));
		next();
	});

	libsb.on('text-up', function(text, next) {
		if($logs.data("lower-limit")) $logs.addBelow(chatEl.render(null, text));
		next();
	});

	libsb.on('navigate', function(state, next) {
		var reset = false;
		if(state.source == 'text-area') return next();
		if(state.source == "init") {
			room = state.room || currentState.room;
			thread = state.thread || currentState.thread;
			time = state.time || time
			reset = true;
		}else {
			if(state && (!state.old || state.room != state.old.room)) {
				room = state.room;
				reset = true;
			}
			if(typeof state.thread != "undefined" && state.old && state.thread != state.old.thread) {
				thread = state.thread;
				reset = true;
			}
			if(state.old && state.time != state.old.time) {
				time = state.time;
				reset = true;
			}
		}

		if(reset) {
			$logs.reset(time);
		}
		next();
	}, 200);


	// The chatArea API.
	chatArea.setBottom = function(bottom) {
		var atBottom = ($logs.scrollTop() + $logs.height() == $logs[0].scrollHeight);

		$logs.css({ bottom: bottom });
		if(atBottom) $logs.scrollTop($logs[0].scrollHeight);
	};

	chatArea.setRoom = function(r) {
		room = r;
		$logs.find(".chat").remove();
		$logs.scroll();
	};

	// --- add classes to body to reflect state ---

	var timeout,
		top = $(this).scrollTop();

	$logs.on("scroll", function() {
		var atBottom = ($logs.scrollTop() + $logs.height() == $logs[0].scrollHeight);
		var cur_top = $logs.scrollTop();

		if(atBottom) return;

		if (top < cur_top) {
			$("body").removeClass("scroll-up").addClass("scroll-down");
		} else {
			$("body").removeClass("scroll-down").addClass("scroll-up");
		}

		top = cur_top;

		$("body").addClass("scrolling");

		if(timeout) clearTimeout(timeout);

		timeout = setTimeout(function(){
			$("body").removeClass("scrolling").removeClass("scroll-up").removeClass("scroll-down");
			timeout = 0;
		}, 1000);

		var chats = $logs.find('.chat-item'),
			time = chats.eq(0).data("index"),
			parentOffset = $logs.offset().top,
			i;

		for(i=0; i<chats.size(); i++) {
			if(chats.eq(i).offset().top - parentOffset > 0) {
				time = chats.eq(i).data("index");
				break;
			}
		}
		if(libsb.isInited) {
			libsb.emit('navigate', { time: time, source: 'text-area' });
		}else{
			libsb.on("inited", function(q, n){
				libsb.emit('navigate', { time: time, source: 'text-area' });
				n();
			});
		}

		$(".chat-position").text(format.friendlyTime(time, new Date().getTime()));

	});
	window.chatArea = chatArea;
});
