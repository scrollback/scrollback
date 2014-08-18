var userCache = require('./userCache.js');

module.exports = function (core) {
	
	core.on("getUsers", function (query, next) {
		// run before socket
		// TODO: add result source as localStorage
		if (query.hasOwnProperty("memberOf")) {
			// fetching member info
			if (query.hasOwnProperty("ref")) { // info for a single member
				query.results = userCache.getMembers(query.to, query.ref);
				query.resultSource = "localStrorage";
			} else { // return all members of requested room. 
				query.results = userCache.getMembers(query.to);
				query.resultSource = "localStorage";
			}
		} else if (query.hasOwnProperty("occupantOf")) {
			// fetch occupant info
			query.results = userCache.getOccupants(query.to);
			query.resultSource = "localStorage";
		} else if (query.hasOwnProperty("ref")) {
			// ref alone without memberOf and occupantOf
			// decide how to handle this. Have to return the user object.  
		}
		next();
	}, 100);
	
	core.on("getUsers", function (query, next) {
		// run after socket, do result caching here
		if (query.hasOwnProperty("memberOf")) {
			userCache.putMembers(query.results);
		} else if (query.hasOwnProperty("occupantOf")) {
			userCache.putOccupants(query.results);
		}
		next();
	}, 8);

};