module.exports = function(core){
	core.on('user', function(action, callback){
		if(action.role === "guest") return callback(new Error('ERR_NOT_ALLOWED'));
		if(action.old == null) return callback();
		else if (action.from === action.old.id) return callback();
		else callback(new Error('ERR_NOT_ALLOWED'));
	});
};