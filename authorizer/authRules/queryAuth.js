"use strict";

var SbError = require('../../lib/SbError.js'),
	SessionInfo = require('../../lib/session-info.js');

module.exports = function(core) {
	core.on('getRooms', function(query, next) {
		if (new SessionInfo(query.session).isInternal()) {
			return next();
		}

		var isFull = true,
			split;

		if (query.identity) {
			split = query.identity.split(":");

			isFull = (split[1] && split[1].length);
		}

		if (query.identity && !isFull && query.user.role !== 'su' && !/^internal/.test(query.session)) {
			return next(new SbError('ERR_NOT_ALLOWED')); // prob not a good idea to send requiredRole as superuser to client :)
		}

		next();
	}, "authorization");

	core.on('getUsers', function(query, next) {
		if (new SessionInfo(query.session).isInternal()) {
			return next();
		}

		if (query.identity && query.user.role !== 'su' && !/^internal/.test(query.session)) {
			next(new SbError('ERR_NOT_ALLOWED')); // prob not a good idea to send requiredRole as superuser to client :)
		} else {
			next();
		}
	}, "authorization");
};
