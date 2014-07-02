module.exports = function(core){
    core.on('room', function(action, callback){
		//console.log("room auth:**** ", JSON.stringify(action));
		if(action.user.role === "none"){
			if(/^guest-/.test(action.user.id)) action.user.role = 'guest';
		}else{
			action.user.role = "registered";	
		} 
		if (action.user.role === 'su') return callback(); 
		if(action.user.role === "guest") return callback(new Error('ERR_NOT_ALLOWED'));
        if(action.user.role === "owner") return callback();
        if(!action.old || (typeof action.old == "object" && Object.keys(action.old).length===0)) return callback();
        return callback(new Error('ERR_NOT_ALLOWED'));
    }, "authorization");
};
