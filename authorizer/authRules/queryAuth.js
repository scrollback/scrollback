var permissionLevels = require('../permissionWeights.js');
module.exports = function(core){
	core.on('getTexts', function(query, callback){
		if(!query.room.params.authorizer) query.room.params.authorizer = {};
		if(query.room.params.authorizer.readLevel === undefined) query.room.params.authorizer.readLevel = 'guest';
		console.log("################ Authorizer readlevel, user.role.level", permissionLevels[query.room.params.authorizer.readLevel], query);
		if(permissionLevels[query.room.params.authorizer.readLevel] <= permissionLevels[query.user.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	}, "authorization");
	core.on('getThreads', function(query, callback) {
		if(query.q && !query.room) {
			return callback();
		}
		if(!query.room.params || !query.room.params.authorizer.readLevel) return callback();
		if(query.room.params.authorizer.readLevel === undefined) query.room.params.authorizer.readLevel = 'guest';
		if(permissionLevels[query.room.params.authorizer.readLevel] <= permissionLevels[query.user.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	}, "authorization");
};
