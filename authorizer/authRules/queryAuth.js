"use strict";

var SbError = require('../../lib/SbError.js');
var sessionUtils = require('../../lib/session-utils.js');
var log = require('./../../lib/logger.js');

module.exports = function(core) {
	core.on('getRooms', function(query, next) {
		if (sessionUtils.isInternalSession(query.session)) return next();
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
		log.d("GetUsers", query);
		if (sessionUtils.isInternalSession(query.session)) return next();
		if (query.identity && query.user.role !== 'su' && !sessionUtils.isInternalSession(query.session)) {
			next(new SbError('ERR_NOT_ALLOWED')); // prob not a good idea to send requiredRole as superuser to client :)
		} else next();
	}, "authorization");

};
