/* global localStorage */
/* global window */
var generate = require('../lib/generate');
var libsb;
var cacheOp = Object.create(require('./cacheOperations'));

cacheOp.update(); // updates client's LS version to current
cacheOp.load(); // initial load of all LS entries apart from ArrayCaches

module.exports = function (c) {
	
	libsb = c;
	libsb.user = cacheOp.cache.user;
	libsb.memberOf = cacheOp.cache.memberOf;
	
	libsb.on('init-up', function (init, next) {
		var sid;
		if (cacheOp.cache && cacheOp.cache.session) {
			libsb.session = sid = cacheOp.cache.session;
		}
		if (!sid) {
			cacheOp.cache.session = sid = "web://" + generate.uid();
			libsb.session = cacheOp.cache.session;
			cacheOp.save();
		}
		init.session = sid;
		return next();
	}, "validation");

	libsb.on('back-dn', function (back, next) {
		if (back.from !== libsb.user.id) return next();

		// loading ArrayCache from LocalStorage when user has navigated to the room.
		window.backTimes[back.to] = back.time;

		var o;
		var key = cacheOp.generateLSKey(back.to, 'texts');
		var thKey = cacheOp.generateLSKey(back.to, 'threads');
		var roomName = back.to;
		var regex = new RegExp(roomName + '(_.+)?_' + 'texts');

		// load all ArrayCaches with <roomName>*_texts
		for (o in localStorage) {
			if (regex.test(o)) {
				cacheOp.loadArrayCache(o);
			}
		}
		// loading <roomName>_threads

		cacheOp.loadArrayCache(thKey);
		cacheOp.loadArrayCache(key);

		var items = cacheOp.cache[key].d;
		var lastMsg = items[items.length - 1];
		var time = lastMsg ? lastMsg.time : null;

		cacheOp.end('time', key, time);

		for (o in cacheOp.cache) {
			if (regex.test(o)) {
				cacheOp.end('time', o, time);
			}
		}
		next();
	}, 1000);

	libsb.on('back-dn', function (back, next) {
		// store a result-start in ArrayCache, to indicate the beginning of the current stream of messages from the user
		if (back.from !== libsb.user.id) return next();
		var key = cacheOp.generateLSKey(back.to, 'texts');

		cacheOp.start('time', key, back.time);

		var roomName = back.to;
		var regex = new RegExp(roomName + '(_.+)?_' + 'texts');
		for (var o in cacheOp.cache) {
			if (regex.test(o)) {
				cacheOp.start('time', o, back.time);
			}
		}

		// updating cache with edits etc ..
		// cacheOp.updateArrayCache(key, back.to, 'time');

		next();
	}, 500);

	libsb.on('init-dn', function (init, next) {
		// on signup.
		if (init.auth && !init.user.id) return next();

		cacheOp.cache.user = init.user;
		cacheOp.cache.occupantOf = init.occupantOf;
		cacheOp.cache.memberOf = init.memberOf;

		// caching occupantOf and memberOf to cache.rooms

		cacheOp.rooms = cacheOp.rooms ? cacheOp.rooms : {};

		init.occupantOf.forEach(function (room) {
			cacheOp.rooms[room.id] = room;
			cacheOp.delRoomTimeOut(room.id);
		});

		init.memberOf.forEach(function (room) {
			cacheOp.rooms[room.id] = room;
			cacheOp.delRoomTimeOut(room.id);
		});

		cacheOp.save();
		next();
	}, 500);

	libsb.on('away-dn', function (away, next) {
		// store a result-end to the end of ArrayCache to show that the text stream is over for the current user
		if (away.from !== libsb.user.id) return next();
		var key = cacheOp.generateLSKey(away.to, 'texts');
		cacheOp.end('time', key, away.time);
		// soln below is generic for all subthreads in a room.

		var roomName = away.to;
		var regex = new RegExp(roomName + '(_.+)?_' + 'texts');
		for (var o in cacheOp.cache) {
			if (regex.test(o)) {
				cacheOp.end('time', o, away.time);
			}
		}

		next();
	}, 500);

	require('./textsCaching.js')(cacheOp);
	require('./threadsCaching.js')(cacheOp);
	require('./roomsCaching.js')(cacheOp);
	require('./membersCaching.js')();

	libsb.on('logout', function logout(p, n) {
		// delete user session here
		delete cacheOp.cache.session;
		delete cacheOp.cache.user;
		delete libsb.session;
		delete libsb.user;
		localStorage.clear(); // clear LocalStorage on logout for security reasons
		cacheOp.save();
		n();
	}, 1000);
};