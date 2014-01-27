module.exports = function(types) {
	return {
		put : function(data, cb) {
			types.awayback.put(data, function(){
				if(data.type == "back") {
					types.rooms.link(data.room.id, 'hasOccupant', data.user.id, {time: data.time}, function(err, data) {
						console.log(err, data);
					});
				}else{
					types.rooms.unlink(data.room.id, 'hasOccupant', data.user.id);	
				}
			});
		}
	}
};