var log = require("../../lib/logger.js");

module.exports = function(types) {
	return {
		put : function(data, cb) {
			types.awayback.put(data, function(){
				if(/^guest-/.test(data.from)) return cb();

				if(!data.room.id) {
					data.room ={id:data.to[0], type: "room",params:{}};
					types.rooms.put(data.room, link);
				}else{
					link();
				}
				function link() {
					if(data.type == "back") {
						types.rooms.link(data.room.id, 'hasOccupant', data.user.id, {time: data.time}, function(err, data) {
							console.log(err, data);
							cb();
						});
					}else{
						types.rooms.unlink(data.room.id, 'hasOccupant', data.user.id, function(err, res){
							log(err, res);
							cb();
						});	
					}
				}
			
			});
		}
	}
};