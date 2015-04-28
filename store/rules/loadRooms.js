module.exports = function(core, config, store) {
	function loadRoom(roomId) {
		core.emit("getEntities", (roomId.indexOf(":") >= 0) ? {
			identity: roomId
		} : {
			ref: roomId
		}, function(err, data) {
			var newRoom, updatingState = {
				entities: {}
			};

			if (data && data.results && data.results.length) {
				newRoom = data.results[0];
				if (roomId !== newRoom.id) {
					updatingState.nav = {
						room: newRoom.id
					};

					updatingState.entities[roomId] = null;
				}

				updatingState.entities[newRoom.id] = newRoom;

			} else {
				updatingState.entities[roomId] = "missing";
			}

			core.emit("setstate", updatingState);
		});
	}

	core.on("setstate", function(changes, next) {
		var roomObj;

		if (changes.nav && changes.nav.room) {
			roomObj = (changes.entities && changes.entities[changes.nav.room]) || store.getRoom(changes.nav.room);

			if (typeof roomObj === "object") return next();

			if (!changes.entities) changes.entities = {};

			changes.entities[changes.nav.room] = "loading";

			loadRoom(changes.nav.room);
		}
		next();
	}, 999);
};

