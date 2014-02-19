var log = require("../../lib/logger.js");

module.exports = function(core) {
	var pluginContent = "";
	core.on('room', function(r, callback) {
		var err;
		log("Heard \"room\" event", r);

		if(r && r.old && r.old.owner && r.owner !== r.old.owner) {
			return callback(new Error("ROOM_AUTH_FAIL"));
		}
		callback();
	}, "authentication");
};

