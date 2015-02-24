var store, core, config;

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
		init.memberOf.forEach(function(e) {
			entities[e.id] = e;
		});
		next();
	}, 1000);
};

function handleRoomChange(newState) {
    var room = newState.changes.nav.room;
    if (!store.entities[room] || store.entities[room] !== "loading") {
        store.entities[room] = "loading";
        core.emit("getEntity", (room.indexOf(":") >= 0) ? { identity:room } : { ref:room }, function(err, data) {
            var newRoom, updatingState = {
                changes:{
                    entities:{}
                }
            };

            if (!err && data.results.length) {
                newRoom = data.results[0];
                (newState.changes.entities = newState.changes.entities || {})[room] = "loading";
                updatingState.changes.entities[newRoom.id] = newRoom;
                updatingState.changes.entities[room] = null;

                core.emit("setstore", updatingState);
            }
        });
    }
}

function handleTextChange() {

}

function handleThreadChange() {

}
