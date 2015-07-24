var SbError = require('./../../lib/SbError.js');
module.exports = function(core, config) {
	return function(action) {
		var origin = action.origin,
			room = action.room,
			guides;
		var error = (new SbError("AUTH:DOMAIN_MISMATCH", {
			source: 'authorizer',
			action: 'text'
		}));
		if(action.type === "room") room = action.old;
		if (!origin || !room) return error;
		guides = room.guides;
		if (origin.verified !== true) {
			return error;
		}

		if (origin.host === config.global.host) return;
		if (guides && guides.allowedDomains && guides.allowedDomains.length) {
			if (guides.allowedDomains.indexOf(origin.host) == -1) {
				return error;
			}
		}
	};
};
