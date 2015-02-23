var state, core, config;

module.exports = function(c, conf, options) {
    state = options.state;
    core = c;
    config = conf;

    core.on("setstate", function(newState, next) {
        /*
        check for the changes in room, thread their ranges. load stuff from the server if not available fire a query and call next with loading property.
        else
        call next and hope the components pick stuff from the state.
        */
        if (newState.changes.nav.room) handleRoomChange(newState);
        if (newState.changes.nav.textRange) handleTextChange(newState);
        if (newState.changes.nav.threadRange) handleThreadChange(newState);
        next();
    });
};

function handleRoomChange(newState) {
    var room = newState.changes.nav.room;
    if (!state.entities[room] || state.entities[room] !== "loading") {
        state.entities[room] = "loading";
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

                core.emit("setstate", updatingState);
            }
        });
    }
}

function handleTextChange() {

}

function handleThreadChange() {

}
