module.exports = function(core){
	core.on('join', function(action, callback){
		if(action.role === "guest") return callback(new Error('ERR_NOT_ALLOWED'));
		if(action.role === "owner") return callback(); // owner can switch to any role
		else if(action.role === "moderator" && action.requestedRole !== "owner") return callback();
		else if(action.role === "registered" && action.requestedRole === "follower"){
			if(action.room.params.authorizer.openFollow){
				return callback();
			} else {
				action.requestedRole = "follow_requested";
				return callback();
			}
		}
		else {
			if(action.role === action.user.invitedRole)	return callback();
			else return callback(new Error("ERR_NOT_ALLOWED"));
		}
	});
};