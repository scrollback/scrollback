var permissionLevels = require('../permissionWeights.js');
module.exports = function(core){
	core.on('text', function(action, callback){
		if(!action.room.params || !action.room.params.authorizer.writeLevel) return callback();
		if(action.room.params.authorizer.writeLevel === undefined) action.room.params.authorizer.writeLevel = 'guest';
		if(permissionLevels[action.room.params.authorizer.writeLevel] <= permissionLevels[action.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	}, "authorization");
};
