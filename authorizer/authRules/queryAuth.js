var permissionLevels = require('../permissionWeights.js');
module.exports = function(core){
	core.on('getTexts', function(query, callback){
		if(permissionLevels[query.room.params.readLevel] <= permissionLevels[query.user.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	});
	core.on('getThreads', function(query, callback){
		if(permissionLevels[query.room.params.readLevel] <= permissionLevels[query.user.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	});
};