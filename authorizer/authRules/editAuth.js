module.exports = function(core){
	core.on('edit', function(action, callback){
		if(action.user.role === "moderator" || action.user.role === "owner") return callback();
		else if(action.user.role === "follower" || action.user.role === "registered"){
			if(action.from === action.old && action.from === action.old.editInverse[action.old.editInverse.length-1].from) return callback();
		}
		return callback(new Error('ERR_NOT_ALLOWED'));
	});
};