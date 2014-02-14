module.exports = function(types) {
	return {
		put : function(data, cb) {
			types.admitexpel.put(data, function() {
				types.rooms.link(data.room.id, 'hasMember', data.user.id, {
					role: data.role || "none",
					time: data.time,
					ref:data.ref
				});	
			});
			
		}
	}
};