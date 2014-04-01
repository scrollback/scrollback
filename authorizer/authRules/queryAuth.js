var permissionLevels = require('../permissionWeights.js');
module.exports = function(core){
	core.on('getTexts', function(action, callback){
		if(permissionLevels[action.room.params.readLevel] <= permissionLevels[action.user.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	});
	core.on('getThreads', function(action, callback){
		if(permissionLevels[action.room.params.readLevel] <= permissionLevels[action.user.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	});
}; 