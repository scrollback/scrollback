var relationsProps = require("./../property-list.js").relations;
var core, config, store;
module.exports = function(c, conf, s) {
	core = c;
	conf = config;
	store = s;
	core.on("back-dn", function(backDn, next) {
		if (store.get("user") === backDn.from) loadUsersList(backDn.to);
		next();
	}, 1000);
};

function constructEntitiesFromUserList(list, entities, roomId) {
	list.forEach(function(e) {
		var relation;

		if (entities[roomId + "_" + e.id]) relation = entities[roomId + "_" + e.id];
		else relation = {};

		relation.room = roomId;
		relation.user = e.id;
		relation.status = "offline";
		relationsProps.forEach(function(key) {
			if (e[key]) {
				relation[key] = e[key];
				delete e[key];
			}
		});
		entities[e.id] = e;
		entities[roomId + "_" + e.id] = relation;
	});
}

function loadUsersList(roomId) {
	var occupantList, memberList, done = false,
		entities = {},
		listeningRooms = store.get("app", "listeningRooms");
	
	if(Array.isArray(listeningRooms)) {
		listeningRooms = Array.prototype.slice.call(listeningRooms);
	} else {
		listeningRooms = [];
	}

	if (listeningRooms.indexOf(roomId) < 0) listeningRooms.push(roomId);

	function emitSetState() {
		constructEntitiesFromUserList(memberList, entities, roomId);
		constructEntitiesFromUserList(occupantList, entities, roomId);
		occupantList.forEach(function(e) {
			entities[roomId + "_" + e.id].status = "online";
		});
		core.emit("setstate", {
			entities: entities,
			app: {
				listeningRooms: listeningRooms
			}
		});
	}

	core.emit("getUsers", {
		type: "getUsers",
		memberOf: roomId
	}, function(err, data) {
		memberList = data.results || [];
		if (!done) done = true;
		else emitSetState();
	});
	core.emit("getUsers", {
		type: "getUsers",
		occupantOf: roomId
	}, function(err, data) {
		occupantList = data.results || [];
		if (!done) done = true;
		else emitSetState();
	});
}
