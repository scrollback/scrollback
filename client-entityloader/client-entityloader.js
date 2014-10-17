/* jshint browser: true */
/* global window*/

var currentState = window.currentState;

module.exports = function (libsb) {
	libsb.on("navigate", function (state, n) {
		function next() {
			n();
		}
		if (["normal","conf"].indexOf(state.mode) >=0 && (!state.old || state.roomName != state.old.roomName)) {
			libsb.getRooms({
				ref: state.roomName
			}, function (err, data) {
				if (err) {
					console.log("ERROR: ", err, data);
					return next(err);
				}

				if (!data || !data.results || !data.results.length) {
					libsb.emit('getUsers', {
						ref: state.roomName,
						source: "loader"
					}, function (e, d) {
						if (d.results && d.results.length) {
							state.mode = 'profile';
						} else {
							state.room = null;
							if (state.connectionStatus!= "online") {
								roomStatus = "pending";
							} else {
								roomStatus = "noroom";
								state.mode = "noroom";
							};
						}
						return next();
					});
				} else {
					state.room = data.results[0];
					return next();
				}
			});
		} else {
			state.room = currentState.room;
			next();
		}
	}, 998);
};
