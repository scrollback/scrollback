/* jshint jquery: true */
/* global libsb, threadEl */
/* exported chatArea */

var threadArea = {};

$(function() {
	var $threads = $(".pane-threads"),
		room = window.location.pathname.split("/")[1],
		time = null; /* replace this with the time from the URL, if available. */

	// Set up infinite scroll here.

	$threads.infinite({
		scrollSpace: 2000,
		fillSpace: 500,
		itemHeight: 100,
		startIndex: time,
		getItems: function (index, before, after, recycle, callback) {
			/*console.log("getThreads", {
				to: room, time: index, before: before, after: after
			});*/

			if(libsb.isInited) {
				loadThreads();
			}else {
				libsb.on("inited", function(q, n) {
					loadThreads();
					n();
				})
			}

			function loadThreads() {
				libsb.getThreads({
					to: room, time: index, before: before, after: after
				}, function(err, t) {
					var threads = t.results;
					if(err) throw err; // TODO: handle the error properly.

					if(after === 0 && threads.length < before) threads.unshift(false);
					else if(before === 0 && threads.length < after) threads.push(false);

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
		if(state.source == 'thread-area') return next();

		if(!state.old) {
			room = state.room;
			reset = true;
		}else if(state.room != state.old.room) {
			room = state.room;
			reset = true;
		}

		if(reset) $threads.reset(time);

		next();
	});


	libsb.on('text-dn', function(text, next) {
		if($threads.data("lower-limit"))
			$threads.addBelow(renderChat(null, text));
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
