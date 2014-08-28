/* global libsb, currentState */
var userCache = require('./userCache.js');

module.exports = function () {
	libsb.on("getUsers", function (query, next) {
		if (query.noCache && query.noCache === true) {
			return next();
		}
		// run before socket
		if (query.hasOwnProperty("memberOf")) {
			// fetching member info
			if (query.hasOwnProperty("ref")) { // info for a single member
				userCache.getMembers(query.memberOf, query.ref, function (data) {
					if (data === null) return next();
					query.results = data;
					query.resultSource = "localStorage";
					next();
				});
			} else { // return all members of requested room.
				userCache.getMembers(query.memberOf, null, function(data) {
					if (data === null) return next();
					query.results = data;
					query.resultSource = "localStorage";
					next();
				});
			}
		} else if (query.hasOwnProperty("occupantOf")) {
			// fetch occupant info
			userCache.getOccupants(query.occupantOf, null, function(results) {
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
			userCache.putMembers(query.memberOf, query.results);
		} else if (query.hasOwnProperty("occupantOf")) {
			userCache.putOccupants(query.occupantOf, query.results);
		}
		next();
	}, 8);

	libsb.on("join-dn", function (join, next) {
		userCache.putMembers(join.to, join.user);
		next();
	}, 900);

	libsb.on("part-dn", function (part, next) {
		userCache.removeMembers(part.to, part.user);
		next();
	}, 900);

	libsb.on("away-dn", function (away, next) {
		if (away.from === libsb.user.id) {
			userCache.saveUsers();
		}
		userCache.removeOccupants(away.to, away.user);
		next();
	}, 900);

	libsb.on("back-dn", function (back, next) {
		if (back.from === libsb.user.id) {
			userCache.populateMembers(back.to);
			userCache.populateOccupants(back.to);
			userCache.loadUsers();
			
			/*
				This is a hack: server is not sending a user object with the back message
				for the same user (apart from the first time).
			*/
			if (typeof back.user === "undefined") {
				back.user = libsb.user;
			}
		}
		userCache.putOccupants(back.to, back.user);
		next();
	}, 900);

	libsb.on("init-dn", function (init, next) {
		/*
			CurrentState.roomName is undefined here, which should not happen.
			This code was tested by hardcoding this value.
			Apparently, after Harish's navigation, boot manager etc is pushed, this should be resolved.
		*/
		userCache.deletePersistence();
		userCache.populateMembers(currentState.roomName);
		userCache.populateOccupants(currentState.roomName);

		next();
	}, 500);

};