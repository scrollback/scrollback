module.exports = function(core, config, store) {	
	function loadRoom(roomId) {
		console.log("loading room", roomId);
		core.emit("getEntities", (roomId.indexOf(":") >= 0) ? {
			identity: roomId
		} : {
			ref: roomId
		}, function(err, data) {
			var newRoom, updatingState = {
				entities: {}
			};
			console.log('got room', data.results);
			if (data && data.results && data.results.length) {
				newRoom = data.results[0];
				if (roomId !== newRoom.id) {
					updatingState.nav = {
						room: newRoom.id
					};
					console.log('setting old to null', roomId);
					updatingState.entities[roomId] = null;
				}
				
				console.log('setting new ', newRoom);
				updatingState.entities[newRoom.id] = newRoom;
				
			} else {
				console.log('setting missing', roomId);
				if(!updatingState.context) updatingState.context = 
				updatingState.entities[roomId] = "missing";
			}
			core.emit("setstate", updatingState);
		});
	}

	core.on("setstate", function(changes, next) {
		var roomObj;
		if(changes.nav && changes.nav.room) {
			roomObj = (changes.entities && changes.entities[changes.nav.room]) || store.getRoom(changes.nav.room);
			if(roomObj !== "unknown") return next();
			
			if(!changes.entities) changes.entities = {};
			changes.entities[changes.nav.room] = "loading";
			loadRoom(changes.nav.room);
		}
		next();
	}, 999);
};

