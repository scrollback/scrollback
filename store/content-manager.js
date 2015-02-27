var store, core, config;
var relationsProps = ['role', 'transistionTime'];
module.exports = function(c, conf, s) {
	store = s;
	core = c;
	config = conf;

	core.on("setState", function(newState, next) {
		/*
        check for the changes in room, thread their ranges. load stuff from the server if not available fire a query and call next with loading property.
        else
        call next and hope the components pick stuff from the store.
        */
		if (newState.nav.room) handleRoomChange(newState);
		if (newState.nav.textRange) handleTextChange(newState);
		if (newState.nav.threadRange) handleThreadChange(newState);
		next();
	});

	core.on("init-dn", function(init, next) {
		var entities = {};
		init.occupantOf.forEach(function(e) {
			entities[e.id] = e;
			entities[e.id + "_" + init.user.id] = {
				room: e.id,
				user: init.user.id,
				status: "online"
			};
		});

		init.memberOf.forEach(function(e) {
			if (!entities[e.id]) entities[e.id] = e;
			if (entities[e.id + "_" + init.user.id]) {
				entities[e.id + "_" + init.user.id].role = e.role;
			} else {
				entities[e.id + "_" + init.user.id] = {
					room: e.id,
					user: init.user.id,
					status: "offline",
					role: e.role
				};
			}
		});
		core.emit("setState", {
			entities: entities
		});
		next();
	}, 1000);
};

function loadRoom(roomId) {
	core.emit("getEntity", (roomId.indexOf(":") >= 0) ? {
		identity: roomId
	} : {
		ref: roomId
	}, function(err, data) {
		var newRoom, updatingState = {
			entities: {}
		};
		
		if (!err && data.results.length) {
			newRoom = data.results[0];
			if (roomId !== newRoom.id) {
				updatingState.nav = {
					room: newRoom.id
				};
			}
			updatingState.entities[roomId] = null;
			updatingState.entities[newRoom.id] = newRoom;
			core.emit("setstore", updatingState);
		}
	});
}

function loadOccupants(roomId) {
	core.emit("getUsers", {
		occupantOf: roomId
	}, function(err, data) {
		var entities = {};
		data.results.forEach(function(e) {
			var relation = {
				user: e.id,
				room: roomId,
				status: "online",
			};

			relationsProps.forEach(function(key) {
				if (relation[key]) {
					relation[key] = e[key];
					delete e[key];
				}
			});
			entities[e.id] = e;
			entities[roomId + "_" + e.id] = relation;
		});
		core.emit("setState", {
			entities: entities
		});
	});
}

function loadMembers(roomId) {
	core.emit("getUsers", {
		memberOf: roomId
	}, function(err, data) {
		var entities = {};
		data.results.forEach(function(e) {
			var relation = {
				user: e.id,
				room: roomId
			};
			relationsProps.forEach(function(key) {
				if (relation[key]) {
					relation[key] = e[key];
					delete e[key];
				}
			});

			entities[e.id] = e;
			entities[roomId + "_" + e.id] = relation;
		});
		core.emit("setState", {
			entities: entities
		});
	});
}


function handleRoomChange(newState) {
	var roomId = newState.nav.room;
	var roomObj = store.getRoom(roomId);

	if (typeof roomObj === "string" && roomObj == "missing") {
		newState.entities[roomId] = "missing";
		loadRoom(roomId);
		if (store.getRelatedUsers(roomId).length) {
			loadMembers(roomId);
			loadOccupants(roomId);
		}
	} else {
		newState.entities[roomId] = roomObj;
	}
}

function handleTextChange() {

}

function handleThreadChange() {

}