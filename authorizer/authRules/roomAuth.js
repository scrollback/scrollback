module.exports = function(core){
	core.on('room', function(action, callback){
		if(action.user.role === "guest") return callback(new Error('ERR_NOT_ALLOWED'));
		if(action.user.role === "owner") return callback();
		else if(action.user.role === "registered" && action.room.old == null) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	}, "authorization");
};