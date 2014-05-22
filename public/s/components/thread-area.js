/* jshint browser: true */
/* global $, libsb, threadEl, currentState */
/* exported chatArea */

var threadArea = {};

$(function() {
	 /* replace this time initialization from the URL, if available. */

	var $threads = $(".thread-item-container"), room = "", time = null,
		search = "", mode = "", searchResult = [false], index = null, queryCount = 0;

	function renderObjects(threads){
		callback(threads.map(function(thread) {
			var index;
			if(currentState.mode == "search") {
				index = thread.i;
			}else {
				index = thread.startTime;
			}
			return thread && threadEl.render(null, thread, index);
		}));
	}

	function loadSearchResult(index, before, after, callback) {
		var query={}, i, l, res = [];
			if(!index) index = 0;
			if(before) {
				if(index === 0){
					return callback([]);
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

			if(to<searchResult.length ) {
				return processResults(from, to);
			}else if(searchResult.length<=1 || searchResult[searchResult.length-1]!== false){
				query.pos = searchResult.length-1;
				query.after = to - query.pos+1;
			}else {
				return processResults(from, searchResult.length-1)
			}

			if(currentState.tab === "search-local") query.to = currentState.room || "";
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

		query.to =  currentState.room || "";
		query.time = index;

		libsb.getThreads(query, function(err, t) {
			var threads = t.results;

			if(err) throw err; // TODO: handle the error properly.

			if(after === 0) {
				if(threads.length < before) {
					threads.unshift({id:"", title: "All Conversations"});
					threads.unshift(false);
				}
				if(t.time) {
					threads.pop();
				}
			}else if(before === 0) {
				if(threads.length < after) {
					threads.push(false);
				}else{
					threads.splice(0,1);
				}
			}
			renderThreads(threads, callback);
		});

	}

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


	$threads.infinite({
		scrollSpace: 2000,
		fillSpace: 500,
		itemHeight: 100,
		startIndex: index,
		getItems: function (index, before, after, recycle, callback) {
			if(currentState.mode == "search"){
				// queryCount++;
				if(libsb.isInited) {
					loadSearchResult(index, before, after, callback);
				}else {
					libsb.on("inited", function(q, n) {
						loadSearchResult(index, before, after, callback);
						n();
					})
				}
			}else{
				if(libsb.isInited) {
					loadThread(index, before, after, callback);
				}else {
					libsb.on("inited", function(q, n) {
						loadThread(index, before, after, callback);
						n();
					})
				}
			}
		}
	});

	$threads.click(function(event) {
		event.preventDefault();
		var $el = $(event.target).closest('.thread-item');
		if(!$el.size()) return;
		libsb.emit('navigate', {source: 'thread-area', thread: $el.attr("id").split('-')[1] });
	});

	libsb.on('navigate', function(state, next) {
		var reset = false;
		if(['search-local', 'search-global', 'threads'].indexOf(state.tab)>=0) {
			$(".pane-threads").addClass("current");
		}else{
			searchResult = [false];
			$(".pane-threads").removeClass("current");
			return next();
		}

		if(state.mode) mode = state.mode;

		if(currentState.mode == "search") {
			$(".tab-"+state.tab).addClass("current");
		}

		if(state.source == 'thread-area') return next();

		if(!state.old) {
			room = state.room;
			reset = true;
		}else if(state.room != state.old.room) {
			room = state.room;
			reset = true;
		}else if(state.query) {
			reset = true;
			search = state.query || "";
		}

		if(reset) {
			if(currentState.mode == "search") {
				$threads.reset(0);
			}else {
				$threads.reset(time);
			}
		}

		next();
	});


	libsb.on('text-dn', function(text, next) {
		// if($threads.data("lower-limit")) $threads.addBelow(renderChat(null, text));
		next();
	});

	// The threadArea API.

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

});
