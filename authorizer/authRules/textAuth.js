var permissionLevels = require('../permissionWeights.js');
module.exports = function(core){
	core.on('text', function(action, callback){
		if(!action.room.params || !action.room.params.writeLevel) return callback();
		if(action.room.params.writeLevel === "undefined") action.room.params.writeLevel = 'guest';
		if(permissionLevels[action.room.params.writeLevel] <= permissionLevels[action.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	}, "authorization");
};
