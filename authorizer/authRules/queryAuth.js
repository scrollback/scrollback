var SbError = require('../../lib/SbError.js');
var permissionLevels = require('../permissionWeights.js');
var config = require('../../myConfig.js');
var internalSession = Object.keys(config.whitelists)[0];
module.exports = function (core) {
	core.on('getTexts', function (query, callback) {
		if (query.user.role === "none") {
			if (/^guest-/.test(query.user.id)) {
				query.user.role = "guest";
			} else {
				query.user.role = "registered";
			}
		}
		if (!query.room.guides || !query.room.guides.authorizer || !query.room.guides.authorizer.readLevel) return callback();
		if (query.room.guides || typeof query.room.guides.authorizer.readLevel === 'undefined') query.room.guides.authorizer.readLevel = 'guest';
		if (permissionLevels[query.room.guides.authorizer.readLevel] <= permissionLevels[query.user.role]) return callback();
		else return callback(new SbError('ERR_NOT_ALLOWED', {
			source: 'authorizer',
			action: 'getTexts',
			requiredRole: query.room.guides.authorizer.readLevel,
			currentRole: query.user.role
		}));
	}, "authorization");
	core.on('getThreads', function (query, callback) {
		var readLevel;
		if (query.user.role === "none") {
			if (/^guest-/.test(query.user.id)) {
				query.user.role = "guest";
			} else {
				query.user.role = "registered";
			}
		}
		if (query.q && !query.room) {
			return callback();
		}
		readLevel = (query.room.guides && query.room.guides.authorizer && query.room.guides.authorizer.readLevel) || 'guest';
		if (permissionLevels[readLevel] <= permissionLevels[query.user.role]) return callback();
		else return callback(new SbError('ERR_NOT_ALLOWED', {
			source: 'authorizer',
			action: 'getThreads',
			requiredRole: query.room.guides.authorizer.readLevel,
			currentRole: query.user.role
		}));
	}, "authorization");

    ['getRooms', 'getUsers'].forEach(function (e) {
		core.on(e, function (query, next) {
			if (query.identity && query.user.role !== 'su' && query.session !== internalSession) {
				next(new SbError('ERR_NOT_ALLOWED')); // prob not a good idea to send requiredRole as superuser to client :)
			} else next();
		}, "authorization");
	});

};