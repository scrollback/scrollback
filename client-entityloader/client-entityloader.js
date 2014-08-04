/* jshint browser: true */
/* global window*/


var currentState = window.currentState;

module.exports = function (libsb) {
    libsb.on("navigate", function (state, n) {
        function next() {
            n();
        }
        if (!state.old || state.roomName != state.old.roomName) {
            libsb.getRooms({
                ref: state.roomName
            }, function (err, data) {
                if (err) {
                    console.log("ERROR: ", err, data);
                    throw err; // handle this better
                }
                if (!data || !data.results || !data.results.length) {
                    state.room = null;
                    if (libsb.isConnected) roomStatus = "pending";
                    else roomStatus = "noroom";
                } else {
                    state.room = data.results[0];
                }
                next();
            });
        } else {
            state.room = currentState.room;
            next();
        }
    }, 998);
};