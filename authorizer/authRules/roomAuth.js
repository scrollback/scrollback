module.exports = function(core){
    core.on('room', function(action, callback){
		console.log("room auth:**** ", JSON.stringify(action));
		if (action.user.role === 'su') return callback(); 
		if(action.user.role === "guest") return callback(new Error('ERR_NOT_ALLOWED'));
        if(action.user.role === "owner") return callback();
        else if(action.room.old === null) return callback();
        else return callback(new Error('ERR_NOT_ALLOWED'));
    }, "authorization");
};
