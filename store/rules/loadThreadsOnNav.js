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
		updatingState.threads[threads.to] = [];
		if (!err && threads.results && threads.results.length) {
			if (threads.before) {
				range.end = threads.time;
				range.start = threads.results[0].startTime;
				if(threads.results.length < threads.before) range.start = null;
			} else if(threads.after) {
				range.start = threads.time;
				range.end = threads.results[threads.results.length - 1].startTime;
				if(threads.results.length < threads.after) range.end = null;
			}
			range.items = threads.results;
			updatingState.threads[threads.to].push(range);
		}
		core.emit("setstate", updatingState);
	}

	function handleThreadRangeChange(newState) {
		var threadRange = newState.nav.threadRange,
			roomId = (newState.nav.room ? newState.nav.room : store.getNav("room")),
			time = threadRange.time || null,
			ranges = [];


		if (threadRange.after) ranges.push(store.getTexts(roomId, time, threadRange.after));
		if (threadRange.before) ranges.push(store.getTexts(roomId, time, -threadRange.before));

		ranges.forEach(function(r) {
			if (r[0] == "missing") {
				core.emit("getThreads", {
					to: roomId,
					time: time,
					before: threadRange.before<16? 16: threadRange.before
				}, threadResponse);
			}
			if (r[r.length - 1] == "missing") {
				core.emit("getThreads", {
					to: roomId,
					time: r.length >= 2 ? r.length - 2 : threadRange.time,
					after: threadRange.after<16? 16: threadRange.after
				}, threadResponse);
			}
		});
	}
};

