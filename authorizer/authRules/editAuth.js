module.exports = function(core){
	core.on('edit', function(action, callback){
		if(action.role === "guest") return callback(new Error('ERR_NOT_ALLOWED'));
		if(action.role === "moderator" || action.role === "owner") return callback();
		else if(action.role === "follower" || action.role === "registered"){
			if(action.from === action.old.from && action.from === action.old.editInverse[action.old.editInverse.length-1].from) return callback();
		}
		return callback(new Error('ERR_NOT_ALLOWED'));
	}, "authorization");
};