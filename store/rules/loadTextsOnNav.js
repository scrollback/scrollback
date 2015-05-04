/*
	Rule: LoadTextsOnTextRange
	Requires: textRange
	Provides: threads (async)
*/

"use strict";

module.exports = function (core, config, store) {
	core.on('setstate', function (changes, next) {
		if(changes.nav && (changes.nav.room || changes.nav.thread || changes.nav.textRange)) {
			handleTextChange(changes);
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
			thread = (typeof newState.nav.thread !== 'undefined' ? newState.nav.thread : store.get("nav", "thread")),
			/* threads may be in the process of being reset using null; in this case, use null. */
			roomId = (newState.nav.room ? newState.nav.room : store.get("nav", "room")),
			time = textRange.time || null,
			r;

		if (textRange.after) {
			r = store.getTexts(roomId, thread, time, textRange.after);
			if(r[r.length-1] === "missing") {
				core.emit("getTexts", {
					to: roomId,
					thread: thread,
					time: (r.length > 1 ? r[r.length - 2].time : time),
					after: Math.max(50, textRange.after - r.length + 1)
				}, textResponse);
			}
		}

		if (textRange.before) {
			r = store.getTexts(roomId, thread, time, -textRange.before);
			if (r[0] === "missing") {
				core.emit("getTexts", {
					to: roomId,
					thread: thread,
					time: (r.length > 1 ? r[1].time : time),
					before: Math.max(50, textRange.before - r.length + 1)
				}, textResponse);
			}
		}
	}

};
