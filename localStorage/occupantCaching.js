/* jshint browser:true */
/* global libsb */

module.exports = function (arrayCacheOps) {
	libsb.on('back-dn', function (back, next) {
		if (back.from !== libsb.user.id) return next();

		// loading ArrayCache from LocalStorage when user has navigated to the room.
		window.backTimes[back.to] = back.time;

		var o;
		var key = arrayCacheOps.generateLSKey(back.to, 'texts');
		var thKey = arrayCacheOps.generateLSKey(back.to, 'threads');
		var roomName = back.to;
		var regex = new RegExp(roomName + '(_.+)?_' + 'texts');

		// load all ArrayCaches with <roomName>*_texts
		for (o in localStorage) {
			if (regex.test(o)) {
				arrayCacheOps.loadArrayCache(o);
			}
		}
		// loading <roomName>_threads

		arrayCacheOps.loadArrayCache(thKey);
		arrayCacheOps.loadArrayCache(key);

		var items = arrayCacheOps.cache[key].d;
		var lastMsg = items[items.length - 1];
		var time = lastMsg ? lastMsg.time : null;

		arrayCacheOps.end('time', key, time);

		for (o in arrayCacheOps.cache) {
			if (regex.test(o)) {
				arrayCacheOps.end('time', o, time);
			}
		}
		next();
	}, 1000);

	libsb.on('back-dn', function (back, next) {
		// store a result-start in ArrayCache, to indicate the beginning of the current stream of messages from the user
		if (back.from !== libsb.user.id) return next();
		var key = arrayCacheOps.generateLSKey(back.to, 'texts');

		arrayCacheOps.start('time', key, back.time);

		var roomName = back.to;
		var regex = new RegExp(roomName + '(_.+)?_' + 'texts');
		for (var o in arrayCacheOps.cache) {
			if (regex.test(o)) {
				arrayCacheOps.start('time', o, back.time);
			}
		}

		// updating cache with edits etc ..

		arrayCacheOps.updateArrayCache(key, back.to, 'time');

		next();
	}, 500);

	libsb.on('away-dn', function (away, next) {
		// store a result-end to the end of ArrayCache to show that the text stream is over for the current user
		if (away.from !== libsb.user.id) return next();
		var key = arrayCacheOps.generateLSKey(away.to, 'texts');
		arrayCacheOps.end('time', key, away.time);
		// soln below is generic for all subthreads in a room.

		var roomName = away.to;
		var regex = new RegExp(roomName + '(_.+)?_' + 'texts');
		for (var o in arrayCacheOps.cache) {
			if (regex.test(o)) {
				arrayCacheOps.end('time', o, away.time);
			}
		}

		next();
	}, 500);

};