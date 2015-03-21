/* jshint browser: true */
/* global $, libsb, currentState */

var threadEl = require("./thread.js"),
	threadArea = {};

(function() {
	var $threads, room = "",
		time = null,
		search = "",
		mode = "",
		searchResult = [],
		index = null;

	function renderSearchResult(threads, callback) {
		callback(threads.map(function(thread) {
			return thread && threadEl.render(null, thread, searchResult.indexOf(thread));
		}));
	}

	function renderThreads(threads, callback) {
		callback(threads.map(function(thread) {
			return thread && threadEl.render(null, thread, thread.startTime);
		}));
	}

	function loadSearchResult(index, before, after, callback) {
		var query = {},
			i, res = [],
			from, to;

		if (!index) index = 0;
		if (before) {
			if (index === 0) return callback([false]);
			from = index - before;
			if (from < 0) from = 0;
			to = index;
		} else {
			from = index;
			if (from === 0) from = 1;
			to = index + after;
		}

		function processResults(from, to) {
			for (i = from; i <= to; i++) {
				if (typeof searchResult[i] !== "undefined") res.push(searchResult[i]);
			}
			renderSearchResult(res, callback);
		}

		if (to < searchResult.length) {
			return processResults(from, to);
		} else if (searchResult.length <= 1 || searchResult[searchResult.length - 1] !== false) {
			query.pos = searchResult.length - 1;
			query.after = to - query.pos + 1;
		} else {
			return processResults(from, searchResult.length - 1);
		}

		if (currentState.tab === "search-local") query.to = currentState.roomName || "";
		query.q = currentState.query;
		libsb.getThreads(query, function(err, t) {
			var threads = t.results;
			searchResult = searchResult.concat(threads);
			if (t.results.length < query.after && searchResult[searchResult.length - 1] !== false) {
				searchResult.push(false);
			}
			processResults(from, to);
		});
	}

	function loadThread(index, before, after, callback) {
		var query = {
			before: before,
			after: after
		};

		if (!index && after) return callback([false]);

		query.to = room;
		query.time = index || null;
		libsb.getThreads(query, function(err, t) {
			var threads = t.results;
			if (err) throw err; // TODO: handle the error properly.
			if(t.to !== currentState.roomName) return callback([]);
			if (!index && threads.length === 0) return callback([false]);

			if (before) {
				if (threads.length < before) {
					threads.unshift(false);
				}
			} else if (after) {
				if (threads.length < after) {
					threads.push(false);
				}
			}
			renderThreads(threads, callback);
		});
	}

	libsb.on('navigate', function(state, next) {
		var reset = false;

		if (state.mode) mode = state.mode;

		if (currentState.mode == "search") {
			$(".tab-" + state.tab).addClass("current");
		}

		if (state.roomName && state.room === null) return next();
		if (state.source == 'thread-area') return next();

		if (!state.old) {
			room = state.roomName;
			reset = true;
		} else if (state.roomName && state.roomName != room) {
			room = state.roomName;
			reset = true;
		} else if (state.old && state.old.query != state.query) {
			reset = true;
			search = state.query || "";
		} else if (state.tab != state.old.tab && state.tab == "threads") {
			reset = true;
		}
		if (['search-local', 'search-global', 'threads'].indexOf(state.tab) >= 0) {
			$(".pane-threads").addClass("current");
		} else {
			searchResult = [false];
			$(".pane-threads").removeClass("current");
			return next();
		}

		if (reset) {
			if (currentState.mode == "search") {
				searchResult.splice(0, searchResult.length);
				searchResult[0] = false;
				$threads.reset(0);
			} else {
				$threads.reset(time);
			}
		}

		next();
	}, 200);


	/*libsb.on('text-dn', function(text, next) {
		if($threads.data("lower-limit")) $threads.addBelow(renderChat(null, text));
		next();
	}, 100);*/
	threadArea.setBottom = function(bottom) {
		var atBottom = ($threads.scrollTop() + $threads.height() == $threads[0].scrollHeight);

		$threads.css({
			bottom: bottom
		});
		if (atBottom) $threads.scrollTop($threads[0].scrollHeight);
	};

	threadArea.setRoom = function(r) {
		room = r;
		$threads.find(".chat").remove();
		$threads.scroll();
	};

	$(function() {
		$threads = $(".thread-item-container");
		window.thread = $threads;
		
		$threads.infinite({
			scrollSpace: 2000,
			fillSpace: 1000,
			itemHeight: 100,
			startIndex: index,
			getItems: function(index, before, after, recycle, callback) {
				if (currentState.mode == "search") {
					$(".search-caption").text("Results for \"" + currentState.query + "\"");
					$(".search-back").text("Back to " + currentState.roomName);

					loadSearchResult(index, before, after, callback);
				} else if (currentState.tab == "threads") {
					loadThread(index, before, after, callback);
				} else {
					callback([]);
				}
			}
		});
		libsb.on("init-dn", function(init, next) {
			$threads.reset();
			next();
		}, 100);

		$(".search-back").click(function(e) {
			libsb.emit("navigate", {
				mode: "normal",
				tab: "threads",
				thread: "",
				q: "",
				time: null
			});
			e.stopImmediatePropagation();
		});
		$threads.click(function(event) {
			event.preventDefault();
			var $el = $(event.target).closest('.thread-item');
			if (!$el.length) return;
			libsb.emit('navigate', {
				source: 'thread-area',
				time: null,
				thread: $el.attr("id").split('-')[1]
			});
		});

		$(".thread-all-discussions").click(function(event) {
			event.preventDefault();
			libsb.emit('navigate', {
				source: 'thread-area',
				time: null,
				thread: ""
			});
		});
	});

	
	
	libsb.on("text-dn", function(action, next) {
		var newThread = null,
			element,
			i, l;
		if (action.labels.startOfThread && $threads.data("lower-limit")) {

			for (i = 0, l = action.threads.length; i < l; i++) {
				if (action.threads[i].id.indexOf(action.id) === 0) {
					newThread = action.threads[i];
					break;
				}
			}
			if (newThread) {
				element = threadEl.render(null, newThread, newThread.startTime);
				if (element) {
					$threads.addBelow(element);
					if($threads.scrollHeight-($threads.height() + $threads.scrollTop()) <50){
						$threads.scrollToBottom();
					}
				}
			}

		}

		next();
	}, 100);
	
	libsb.on('navigate', function(state, next) {
		if (state.old && state.thread !== state.old.thread) {
			$(".thread-item.current").removeClass("current");

			if (state.thread) {
				$("#thread-" + state.thread).addClass("current");
			} else {
				$('.thread-all-discussions').addClass('current');
			}
		}

		next();
	}, 1);
})();
