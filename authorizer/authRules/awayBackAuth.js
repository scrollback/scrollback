var permissionLevels = require('../permissionWeights.js');
module.exports = function(core){
	core.on('back', function(action, callback){
		if(!action.room.guides || !action.room.guides.authorizer) {return callback();}
		if(!action.room.guides.authorizer.readLevel) return callback();
		if(action.room.guides.authorizer.readLevel === undefined) action.room.guides.authorizer.readLevel = 'guest';
		if(permissionLevels[action.room.guides.authorizer.readLevel] <= permissionLevels[action.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	}, "authorization");
};