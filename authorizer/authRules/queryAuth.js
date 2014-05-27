var permissionLevels = require('../permissionWeights.js');
module.exports = function(core){
	core.on('getTexts', function(query, callback){
		if(!query.room.params || !query.room.params.readLevel) return callback();
		if(query.room.params || query.room.params.readLevel === 'undefined') query.room.params.readLevel = 'guest';
		if(permissionLevels[query.room.params.readLevel] <= permissionLevels[query.user.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	}, "authorization");
	core.on('getThreads', function(query, callback) {
		if(query.q && !query.room) {
			return callback();
		}
		if(!query.room.params || !query.room.params.readLevel) return callback();
		if(query.room.params.readLevel === 'undefined') query.room.params.readLevel = 'guest';
		if(permissionLevels[query.room.params.readLevel] <= permissionLevels[query.user.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	}, "authorization");
};
