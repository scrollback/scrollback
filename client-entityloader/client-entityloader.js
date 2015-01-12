/* jshint browser: true */
/* global window*/
var currentState = window.currentState;

module.exports = function(libsb) {
	libsb.on("navigate", function(state, next) {
		var key, query = {};
		key = (state.roomName && state.roomName.indexOf(":") >= 0) ? "identity" : "ref";
		query[key] = state.roomName;
		if (["normal", "conf"].indexOf(state.mode) >= 0 && (!state.old || state.roomName != state.old.roomName || (state.connectionStatus && state.connectionStatus != state.old.connectionStatus))) {
			libsb.getRooms(query, function(err, data) {
				var roomID;
				if (err) {
					console.log("ERROR: ", err, data);
					return next(err);
				}
				console.log("Results:", data);
				if (!data || !data.results || !data.results.length) {
					if (state && state.connectionStatus === "online") {
						if (data.identity) {
							roomID = data.identity.substring(data.identity.lastIndexOf(":")+1);
							state.mode = "noroom";
							state.roomName = roomID;
							state.room = {
								id: roomID,
								identities: [data.identity],
								roomSaved: false
							};
							state.dialog = "createroom";
							return next();
						}else{
							libsb.emit('getUsers', {
								ref: state.roomName,
								source: "loader"
							}, function(e, d) {
								if (d.results && d.results.length) {
									state.mode = 'profile';
								} else {
									state.room = null;

									if (state.connectionStatus == "online") {
										state.mode = "noroom";
									}
								}
								return next();
							});
						}
					} else {
						state.room = null;
						next();
					}
				} else {
					state.room = data.results[0];
					state.roomName = state.room.id;
					return next();
				}
			});
		} else {
			state.room = currentState.room;
			next();
		}
	}, 998);
};