var SbError = require('../../lib/SbError.js');
var permissionLevels = require('../permissionWeights.js');
var utils = require('../../lib/appUtils.js');
var domainCheck;
module.exports = function(core, config) {
	domainCheck = require("../domain-auth.js")(core, config);
	core.on('getTexts', function(query, callback) {
		console.log(query.origin);
		if(!utils.isInternalSession(query.session) && !domainCheck(query.room, query.origin)) return callback(new SbError("AUTH:DOMAIN_MISMATCH"));
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
	core.on('getThreads', function(query, callback) {
		var readLevel;
		if(!domainCheck(query.room, query.origin)) return callback(new SbError("AUTH:DOMAIN_MISMATCH"));
		if (query.user && query.user.role === "none") {
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

	core.on('getRooms', function(query, next) {
		var isFull = true,
			split;

		if (query.identity) {
			split = query.identity.split(":");
			if (!split[1] || !split[1].length) isFull = false;
		}

		if (query.identity && !isFull && query.user.role !== 'su' && !/^internal/.test(query.session)) {
			return next(new SbError('ERR_NOT_ALLOWED')); // prob not a good idea to send requiredRole as superuser to client :)
		}

		next();
	}, "authorization");

	core.on('getUsers', function(query, next) {
		if (query.identity && query.user.role !== 'su' && !/^internal/.test(query.session)) {
			next(new SbError('ERR_NOT_ALLOWED')); // prob not a good idea to send requiredRole as superuser to client :)
		} else next();
	}, "authorization");

};