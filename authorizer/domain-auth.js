module.exports = function(core, config) {
	function check(room, origin) {
		var guides;
		if(!origin || !room) return false;
		guides = room.guides;
		if(origin.domain === config.global.host) return true;
		if (guides && guides.allowedDomains && guides.allowedDomains.length) {
			if (!origin.verified || guides.allowedDomains.indexOf(origin.domain) == -1) {
				return false;
			}
		}
		return true;
	}
	return check;
};