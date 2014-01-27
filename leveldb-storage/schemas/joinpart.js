module.exports = function(types) {
	return {
		put : function(data, cb) {
			types.joinpart.put(data, function(){
				types.rooms.link(data.room.id, 'hasMember', data.user.id, {
					role: data.role || "none",
					time: data.time
				});
			});
		}
	}
};