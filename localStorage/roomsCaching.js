/* global libsb */

module.exports = function (cacheOp) {
	libsb.on('room-dn', function (room, next) {
		var roomObj = room.room;
		if (cacheOp.cache) {
			cacheOp.rooms = cacheOp.rooms ? cacheOp.rooms : {};
			cacheOp.rooms[roomObj.id] = roomObj;
			cacheOp.save();
			cacheOp.delRoomTimeOut(roomObj.id);
		}
		next();
	}, 500);

	libsb.on('getRooms', function (query, next) {
		// only getRooms with ref are cached as of now.
		if (query.cachedRoom === false) return next();
		if (query.hasOwnProperty("hasMember")) {
			if (libsb.isInited !== true) {
				libsb.on('init-dn', function (init, n) {
					setTimeout(function () {
						return next();
					}, 0);
					n();
				}, 100);
			} else {
				return next();
			}
		} else {
			if (!query.ref) {
				return next();
			}

			var rooms = cacheOp.rooms || {};

			if (rooms.hasOwnProperty(query.ref)) {
				query.results = [rooms[query.ref]];
			}

			return next();
		}

	}, 400); // run before socket

	libsb.on('getRooms', function (query, next) {

		if (!query.ref) {
			return next();
		}

		var rooms = {};

		rooms = cacheOp.rooms ? cacheOp.rooms : {};

		if (query.results) {
			query.results.forEach(function (room) {
				rooms[room.id] = room;
				cacheOp.delRoomTimeOut(room.id);
			});
		}

		cacheOp.rooms = rooms;
		cacheOp.save();

		next();

	}, 8); // run after socket
};