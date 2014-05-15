/* jshint jquery: true */
/* global libsb, threadEl */
/* exported chatArea */

var threadArea = {};

$(function() {
	var $threads = $(".pane-threads"),
		room = "",
		time = null; /* replace this with the time from the URL, if available. */
		search = "";
	// Set up infinite scroll here.

	$threads.infinite({
		scrollSpace: 2000,
		fillSpace: 500,
		itemHeight: 100,
		startIndex: time,
		getItems: function (index, before, after, recycle, callback) {
			if(libsb.isInited) {
				loadThreads();
			}else {
				libsb.on("inited", function(q, n) {
					loadThreads();
					n();
				})
			}

			function loadThreads() {
				var query ={};

				if(search) {
					query = {
						q: search
					};

					if(currentState.tab == "search-local") query.to = currentState.room || "";
				}else {
					query = {
						to: currentState.room || "", time: index, before: before, after: after
					};
				}

				libsb.getThreads(query, function(err, t) {
					var threads = t.results;
					if(err) throw err; // TODO: handle the error properly.
					console.log(t);
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
					
					callback(threads.map(function(thread) {
						return thread && threadEl.render(null, thread);
					}));
				});
			}

		}
	});

	$threads.click(function(event) {
		event.preventDefault();
		var $el = $(event.target).closest('.thread');
		if(!$el.size()) return;
		libsb.emit('navigate', {source: 'thread-area', thread: $el.attr("id").split('-')[1] });
	});

	libsb.on('navigate', function(state, next) {
		var reset = false;
		if(['search-local', 'search-global', 'threads'].indexOf(state.tab)>=0) {
			$(".pane-threads").addClass("current");
		}else{
			$(".pane-threads").removeClass("current");			
		}

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
			if(search) {
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
