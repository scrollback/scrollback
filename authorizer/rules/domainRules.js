module.exports = function(core, config) {
	return function(action) {
		var origin = action.origin, room = action.room, guides;
		if (!origin || !room) return false;
		guides = room.guides;
		if(origin.verified !== true) {
			return false;
		}

		if (origin.domain === config.global.host) return true;
		if (guides && guides.allowedDomains && guides.allowedDomains.length) {
			if (guides.allowedDomains.indexOf(origin.domain) == -1) {
				return false;
			}
		}
		
		return true;
	};
};
