var permissionLevels = require('../permissionWeights.js');
module.exports = function(core){
	core.on('back', function(action, callback){
		if(!action.room.params.authorizer) {action.room.params.authorizer = {};}
		if(!action.room.params.authorizer.readLevel) return callback();
		if(action.room.params.authorizer.readLevel === undefined) action.room.params.authorizer.readLevel = 'guest';
		if(permissionLevels[action.room.params.authorizer.readLevel] <= permissionLevels[action.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	}, "authorization");
};