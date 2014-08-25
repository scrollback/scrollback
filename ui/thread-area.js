/* jshint browser: true */
/* global $, libsb, currentState */

var threadEl = require("./thread.js"),
	threadArea = {};

(function() {
	var $threads, room = "", time = null,
	search = "", mode = "", searchResult = [false], index = null;

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
		var query={}, i, res = [], from, to;

			if(!index) index = 0;
			if(before) {
				if(index === 0){
					return callback([false]);
				}
				index--;
				from = index - before;
				if(from <0) {
					to = from+before;
					from = 0;
				}else {
					to = index;
				}
			}else {
				if(index){
					index++;
				}else{
					after++;
				}
				from = index;
				to = index+after;
			}
			function processResults(from, to){
				for(i=from;i<=to;i++) {
					if(typeof searchResult[i] !== "undefined") res.push(searchResult[i]);
				}
				renderSearchResult(res, callback);
			}

			if(to<searchResult.length) {
				return processResults(from, to);
			}else if(searchResult.length<=1 || searchResult[searchResult.length-1]!== false){
				query.pos = searchResult.length-1;
				query.after = to - query.pos+1;
			}else {
				return processResults(from, searchResult.length-1);
			}

			if(currentState.tab === "search-local") query.to = currentState.roomName || "";
			query.q = currentState.query;
			libsb.getThreads(query, function(err, t) {
				var threads = t.results;
				searchResult = searchResult.concat(threads);
				if(t.results.length < query.after) {
					searchResult.push(false);
				}
				processResults(from, to);

			});
	}
	function loadThread(index, before, after, callback) {
		var query  = { before: before, after: after};

		if(!index && after) return callback([false]);
		if(after) query.after = index?after+1: after;
		if(before) query.before = index?before+1: before;

		query.to =  room;
		query.time = index || null;
		libsb.getThreads(query, function(err, t) {
			var threads = t.results;
			if(err) throw err; // TODO: handle the error properly.
            
			if(!index && threads.length === "0") {
				return callback([false]);
			}
            console.log("Brrrrr");
			if(!after) {
				if(!t.time) {
					threads.push(false);

				}else {
					threads.pop();
				}
				if(threads.length < before) {
					threads.unshift(false);
				}
			}else if(before === 0) {
				if(threads.length) threads.splice(0,1);
				if(threads.length < after) {
					threads.push(false);
				}
			}
			renderThreads(threads, callback);
		});
	}

	libsb.on('navigate', function(state, next) {
		var reset = false;

		if(state.mode) mode = state.mode;

		if(currentState.mode == "search") {
			$(".tab-"+state.tab).addClass("current");
		}

        if(state.roomName && state.room === null) return next();
        if(state.source == 'thread-area') return next();

		if(!state.old) {
			room = state.roomName;
			reset = true;
		} else if(state.roomName && state.roomName != room) {
			room = state.roomName;
			reset = true;
		} else if(state.old && state.old.query != state.query) {
			reset = true;
			search = state.query || "";
		} else if(state.tab != state.old.tab && state.tab == "threads") {
			reset = true;
		}

        if(['search-local', 'search-global', 'threads'].indexOf(state.tab)>=0) {
			$(".pane-threads").addClass("current");
		}else {
			searchResult = [false];
			$(".pane-threads").removeClass("current");
			return next();
		}

        if(reset) {
			if(currentState.mode == "search") {
				$threads.reset(0);
			}else {
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

		$threads.css({ bottom: bottom });
		if(atBottom) $threads.scrollTop($threads[0].scrollHeight);
	};

	threadArea.setRoom = function(r) {
		room = r;
		$threads.find(".chat").remove();
		$threads.scroll();
	};

	$(function() {
        $threads = $(".thread-item-container");

		$threads.infinite({
			scrollSpace: 2000,
			fillSpace: 1000,
			itemHeight: 100,
			startIndex: index,
			getItems: function (index, before, after, recycle, callback) {
				if(currentState.mode == "search") {
                    $(".search-caption").text("Results for \"" + currentState.query + "\"");
                    $(".search-back").text("Back to " + currentState.roomName);

                    loadSearchResult(index, before, after, callback);
				}else if(currentState.tab == "threads") {
                    loadThread(index, before, after, callback);
				}
			}
		});
		libsb.on("init-dn", function(init, next) {
			$threads.reset();
			next();
		}, 100);

        $(".search-back").click(function(e) {
            libsb.emit("navigate", {mode: "normal", tab: "threads", thread: "", q:"", time: null});
            e.stopImmediatePropagation();
        });
		$threads.click(function(event) {
			event.preventDefault();
			var $el = $(event.target).closest('.thread-item');
			if(!$el.length) return;
            libsb.emit('navigate', {source: 'thread-area', time: null, thread: $el.attr("id").split('-')[1] });
		});

		$(".thread-all-conversations").click(function(event){
			event.preventDefault();
			libsb.emit('navigate', {source: 'thread-area', time: null, thread: ""});
		});
	});

	libsb.on('navigate', function(state, next) {
		if (state.old && state.thread !== state.old.thread) {
			$(".thread-item.current").removeClass("current");

			if (state.thread) {
				$("#thread-" + state.thread).addClass("current");
			} else{
				$('.thread-all-conversations').addClass('current');
			}
		}

		next();
	}, 1);
})();
