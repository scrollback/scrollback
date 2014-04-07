var permissionLevels = require('../permissionWeights.js');
module.exports = function(core){
	core.on('text', function(action, callback){
		if(permissionLevels[action.room.params.writeLevel] <= permissionLevels[action.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	});
};