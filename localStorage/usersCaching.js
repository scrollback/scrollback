/* global libsb,$ ,currentState */

module.exports = function (objCacheOps) {
	libsb.on("getUsers", function (query, next) {
		if (query.noCache && query.noCache === true) {
			return next();
		}
		// run before socket
		if (query.hasOwnProperty("memberOf")) {
			if (!objCacheOps.hasKnowledgeOf("members", query.memberOf)) return next();
			// fetching member info
			if (query.hasOwnProperty("ref")) { // info for a single member
				objCacheOps.getMembers(query.memberOf, query.ref, function (data) {
					if (data === null) return next();
					query.results = data;
					query.resultSource = "localStorage";
					next();
				});
			} else { // return all members of requested room.
				objCacheOps.getMembers(query.memberOf, null, function(data) {
					if (data === null) return next();
					query.results = data;
					query.resultSource = "localStorage";
					next();
				});
			}
		} else if (query.hasOwnProperty("occupantOf")) {
			if (!objCacheOps.hasKnowledgeOf("occupants", query.occupantOf)) return next();
			// fetch occupant info
			objCacheOps.getOccupants(query.occupantOf, null, function(results) {
				if (results === null) return next();
				query.results = results;
				query.resultSource = "localStorage";
				next();
			});
		} else if (query.hasOwnProperty("ref")) {
			// ref alone without memberOf and occupantOf
			// decide how to handle this. Have to return the user object.
			next();
		} else {
			next();
		}
	}, 100);

	libsb.on("getUsers", function (query, next) {
		// run after socket, do result caching here
		if (query.resultSource && query.resultSource === "localStorage") {
			return next();
		}
		if (query.hasOwnProperty("memberOf")) {
			objCacheOps.putMembers(query.memberOf, query.results);
		} else if (query.hasOwnProperty("occupantOf")) {
			objCacheOps.putOccupants(query.occupantOf, query.results);
		}
		next();
	}, 8);

	libsb.on("join-dn", function (join, next) {
		var user = $.extend({}, join.user);
		user.role = join.role;
		objCacheOps.putMembers(join.to, user);
		next();
	}, 900);

	libsb.on("part-dn", function (part, next) {
		var user = $.extend({}, part.user);
		user.role = part.role;
		objCacheOps.removeMembers(part.to, user);
		next();
	}, 900);

	libsb.on("away-dn", function (away, next) {
		if (away.from === libsb.user.id) {
			objCacheOps.saveUsers();
		}
		objCacheOps.removeOccupants(away.to, away.user);
		next();
	}, 900);

	libsb.on("back-dn", function (back, next) {
		if (back.from === libsb.user.id) {
			objCacheOps.populateMembers(back.to);
			objCacheOps.populateOccupants(back.to);
			objCacheOps.loadUsers();
			
			/*
				This is a hack: server is not sending a user object with the back message
				for the same user (apart from the first time).
			*/
			if (typeof back.user === "undefined") {
				back.user = libsb.user;
				libsb.emit("getUsers", {memberOf: back.to, ref: back.from}, function (e, d) {
					var role;
					
					if (d.results && d.results[0]) {
						role = d.results[0].role;
					}
					
					back.user.role = role;
					objCacheOps.putOccupants(back.to, back.user);
					next();
				});
			}
			else {
				objCacheOps.putOccupants(back.to, back.user);
				next();
			}
		} else {
			objCacheOps.putOccupants(back.to, back.user);
			next();
		}
	}, 900);
	libsb.on("room-dn", function(room, next) {
		var user;
		if(room.from === libsb.user.id) {
			user = $.extend(true, {},libsb.user);
			user.role = "owner";
			objCacheOps.putMembers(room.to, user);
		}
		next();
	}, 100);
	libsb.on("init-dn", function (init, next) {
		objCacheOps.deletePersistence();
		objCacheOps.populateMembers(currentState.roomName);
		objCacheOps.populateOccupants(currentState.roomName);

		next();
	}, 500);

};