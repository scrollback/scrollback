/* global libsb */

module.exports = function (objCacheOps) {
	
	objCacheOps.loadRooms();
	
	libsb.on('room-dn', function (room, next) {
		var roomObj = room.room;
		objCacheOps.rooms = objCacheOps.rooms || {};
		objCacheOps.rooms[roomObj.id] = roomObj;
		objCacheOps.saveRooms();
		objCacheOps.delRoomTimeOut(roomObj.id);
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

			var rooms = objCacheOps.rooms || {};

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

		rooms = objCacheOps.rooms || {};

		if (query.results) {
			query.results.forEach(function (room) {
				rooms[room.id] = room;
				objCacheOps.delRoomTimeOut(room.id);
			});
		}

		objCacheOps.rooms = rooms;
		objCacheOps.saveRooms();

		next();

	}, 8); // run after socket
};