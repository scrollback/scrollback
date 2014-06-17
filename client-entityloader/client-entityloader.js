/* global libsb*/
var generate = require('../lib/generate.js');

module.exports = function() {
	libsb.on("navigate", function(state, next) {
		if(state.roomName) {
			libsb.getRooms({ref: state.roomName}, function(err, data) {
				if(err) {
					throw err; // handle this better
					return;
				}
				if(!data || !data.results || !data.results.length) {
					state.roomName = "pending";
					state.room = null;
				}else{
					state.room = data.results[0];
				}
				next();
			});
		}else {
			next();
		}
	},"loader");
};