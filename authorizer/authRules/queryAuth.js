var SbError = require('../../lib/SbError.js');
var permissionLevels = require('../permissionWeights.js');
var utils = require('../../lib/app-utils.js');
var log = require('../../lib/logger.js');

var domainCheck;
module.exports = function(core, config) {
	domainCheck = require("../domain-auth.js")(core, config);
	core.on('getRooms', function(query, next) {
		if (utils.isInternalSession(query.session)) return next();
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
		if (utils.isInternalSession(query.session)) return next();
		if (query.identity && query.user.role !== 'su' && !/^internal/.test(query.session)) {
			next(new SbError('ERR_NOT_ALLOWED')); // prob not a good idea to send requiredRole as superuser to client :)
		} else next();
	}, "authorization");

};
