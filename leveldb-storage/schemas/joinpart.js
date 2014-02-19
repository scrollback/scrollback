var log = require("../../lib/logger.js");
module.exports = function(types) {
	return {
		put : function(data, cb) {
			types.joinpart.put(data, function() {
				if(!data.room.id) {
					data.room ={id:data.to[0], type: "room",params:{}};
					types.rooms.put(data.room, link);
				}else{
					link();
				}
				function link() {

					if(data.role == "none"){
						types.rooms.unlink(data.room.id, 'hasMember', data.user.id);
					}else{
						types.rooms.link(data.room.id, 'hasMember', data.user.id, {
							role: data.role || "none",
							time: data.time
						});
							
					}
					cb();
				}
			});
		}
	}
};