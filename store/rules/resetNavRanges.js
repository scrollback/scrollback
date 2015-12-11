"use strict";

/*
	Rule: ResetNavRanges
	Reads: room, thread
	Writes: textRange, threadRange
*/

module.exports = function (core) {
	function handle(changes, next) {
		if(changes.nav && (changes.nav.room || changes.nav.thread)) {
			if(changes.nav.room) changes.nav.threadRange = changes.nav.threadRange || {time: null, before: 25};
			changes.nav.textRange = changes.nav.textRange || {time: null, before: 25};
		}
		next();
	}

	core.on('setstate', handle, 900);
};
