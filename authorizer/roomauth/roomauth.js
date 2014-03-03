var log = require("../../lib/logger.js");

module.exports = function(core) {
	core.on('room', function(action, callback) {
		var owner = action.from;
        core.emit("getUsers", {memberOf: action.to, role:"owner"}, function(err, data){
            var isOwner = false;
            var data = data.results;
            if(data) {
                data.forEach(function(user) {
                    if(user.id === owner){
                        isOwner = true;
                        callback();
                    }
                });
                if(!isOwner) {
                    callback("ROOM_AUTH_FAIL");
                }
            }
        });
        /*log("Heard \"room\" event", action);
		if(r && r.old && r.old.owner && r.owner !== r.old.owner) {
			return callback(new Error("ROOM_AUTH_FAIL"));
		}
		callback();*/
	}, "authentication");
};

