module.exports = function(types) {
	return {
		roleChange : function(data, cb) {
			types.rooms.link(data.room.id, 'hasMember', data.user.id, {role: data.role || "none", time: data.time}, function(err, data) {
				console.log(err, data);
			});
		}
	}
};