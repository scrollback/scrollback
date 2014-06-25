var permissionLevels = require('../permissionWeights.js');
module.exports = function(core){
	core.on('getTexts', function(query, callback){
		if(!query.room.guides || !query.room.guides.authorizer || !query.room.guides.authorizer.readLevel) return callback();
		if(query.room.guides || query.room.guides.authorizer.readLevel === undefined) query.room.guides.authorizer.readLevel = 'guest';
		if(permissionLevels[query.room.guides.authorizer.readLevel] <= permissionLevels[query.user.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	}, "authorization");
	core.on('getThreads', function(query, callback) {
		if(query.q && !query.room) {
			return callback();
		}
		if(!query.room.guides || !action.room.guides.authorizer || !query.room.guides.authorizer.readLevel) return callback();
		if(query.room.guides.authorizer.readLevel === undefined) query.room.guides.authorizer.readLevel = 'guest';
		if(permissionLevels[query.room.guides.authorizer.readLevel] <= permissionLevels[query.user.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	}, "authorization");
};
