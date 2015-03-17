/*
	Rule: LoadTextsOnTextRange
	Requires: textRange
	Provides: threads (async)
*/

module.exports = function (core, config, store) {
	core.on('setstate', function (changes, next) {
		if(changes.nav && (changes.nav.room || changes.nav.thread || changes.nav.textRange)) {
			handleTextChange(changes);
		} else {
//			console.log('no text changes for ',changes);
		}
		next();
	}, 850);
	

	function textResponse(err, texts) {
		var updatingState = {
				texts: {}
			},
			range = {},
			key = texts.to;

		if (texts.thread) key += "_" + texts.thread;

		if (!err && texts.results && texts.results.length) {
			if (texts.before) {
				range.end = texts.time;
				range.start = texts.results[0].time;
				if(texts.results.length < texts.before) range.start = null;
			} else if(texts.after) {
				range.start = texts.time;
				range.end = texts.results[texts.results.length - 1].time;
				if(texts.results.length < texts.after) range.end = null;
			}
			range.items = texts.results;

			updatingState.texts[key] = [range];
			core.emit("setstate", updatingState);
		}
	}

	function handleTextChange(newState) {
		var textRange = newState.nav.textRange || {},
			thread = (typeof newState.nav.thread !== 'undefined' ? newState.nav.thread : store.getNav("thread")),
			/* threads may be in the process of being reset using null; in this case, use null. */
			roomId = (newState.nav.room ? newState.nav.room : store.getNav("room")),
			time = textRange.time || null,
			ranges = [];

		if (textRange.after) ranges.push(store.getTexts(roomId, thread, time, textRange.after));
		if (textRange.before) ranges.push(store.getTexts(roomId, thread, time, -textRange.before));

		ranges.forEach(function(r) {
			if (r[0] == "missing") {
				core.emit("getTexts", {
					to: roomId,
					thread: thread,
					time: (r.length >= 2 ? r[1].time : textRange.time) || null,
					before: 50
				}, textResponse);
			}
			if (r[r.length - 1] == "missing") {
				core.emit("getTexts", {
					to: roomId,
					thread: thread,
					time: (r.length >= 2 ? r[r.length - 2].time : textRange.time) || null,
					after: 50
				}, textResponse);
			}
		});
	}

};
