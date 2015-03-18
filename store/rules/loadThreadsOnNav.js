/*
	Rule: LoadThreadsOnThreadRange
	Requires: threadRange
	Provides: threads (async)
*/

module.exports = function (core, config, store) {
	core.on('setstate', function (changes, next) {
		if(changes.nav && (changes.nav.room || changes.nav.threadRange)) {
			handleThreadRangeChange(changes);
		}
		next();
	}, 850);
			
			
	function threadResponse(err, threads) {
		var updatingState = {
				threads: {}
			},
			range = {};
		
		if (!err && threads.results && threads.results.length) {
			updatingState.threads[threads.to] = [];
			
			if (threads.before) {
				range.end = threads.time;
				range.start = threads.results[0].startTime;
				if(threads.results.length < threads.before) range.start = null;
			} else if(threads.after) {
				range.start = threads.time;
				range.end = threads.results[threads.results.length - 1].startTime;
				if(threads.results.length < threads.after) range.end = null;
			} else {
				console.log('neither before nor after?', threads);
			}
			range.items = threads.results;
			updatingState.threads[threads.to].push(range);
			
			console.log('threads loaded', updatingState.threads);
			core.emit("setstate", updatingState);
		}
	}

	function handleThreadRangeChange(newState) {
		var threadRange = newState.nav.threadRange,
			roomId = (newState.nav.room ? newState.nav.room : store.getNav("room")),
			time = threadRange.time || null,
			r;

		if (threadRange.after) {
			r = store.getThreads(roomId, time, threadRange.after);
			if (r[r.length - 1] == "missing") {
				core.emit("getThreads", {
					to: roomId,
					time: (r.length > 1 ? r[r.length - 2].startTime : time),
					after: Math.max(16, threadRange.after - r.length + 1)
				}, threadResponse);
			}
		}
		
		if (threadRange.before) {
			r = store.getThreads(roomId, time, -threadRange.before);
			if (r[0] == "missing") {
				core.emit("getThreads", {
					to: roomId,
					time: (r.length > 1 ? r[1].startTime : time),
					before: Math.max(16, threadRange.before - r.length + 1)
				}, threadResponse);
			}
		}
	}
};

