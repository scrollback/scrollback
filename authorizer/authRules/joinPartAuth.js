module.exports = function(core){
	core.on('join', function(action, callback){
		if(!action.room.guides.openFollow) action.room.guides.openFollow = true;
		if(!action.user.role) action.user.role = "registered";
		if(!action.user.requestedRole) action.user.requestedRole = "";
		if(!action.user.invitedRole) action.user.invitedRole = "";
		if(action.user.role === "guest") return callback(new Error('ERR_NOT_ALLOWED'));
		if(action.user.role === "owner") return callback(); // owner can switch to any role
		else if(action.user.role === "moderator" && action.user.requestedRole !== "owner") return callback();
		else if(action.user.role === "registered" && action.room.guides.openFollow) return callback();
		else if(action.user.role === "registered" && action.user.requestedRole === "follower"){
			if(action.room.guides.openFollow){
				return callback();
			} else {
				action.user.requestedRole = "follow_requested";
				return callback();
			}
		}
		else {
			if(action.user.role === action.user.invitedRole) return callback();
			else return callback(new Error("ERR_NOT_ALLOWED"));
		}
	}, "authorization");
};
