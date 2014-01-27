var log = require("../../lib/logger.js");
module.exports = function(types) {
	return {
		put : function(data, cb) {
			types.joinpart.put(data, function() {
				if(!data.room.id) {
					data.room ={id:data.to[0], type: "room",params:{}};
					types.room.put(data.room, link);
				}else{
					link();
				}
				function link() {
					types.rooms.link(data.room.id, 'hasMember', data.user.id, {
						role: data.role || "none",
						time: data.time
					});
					cb();
				}
			});
		}
	}
};