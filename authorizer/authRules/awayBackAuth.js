var permissionLevels = require('../permissionWeights.js');
module.exports = function(core){
	core.on('back', function(action, callback){
		if(action.room.params.readLevel === 'undefined') action.room.params.readLevel = 'guest';
		if(permissionLevels[action.room.params.readLevel] <= permissionLevels[action.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	}, "authorization");
};