"use strict";

var sessionUtils = require('../lib/session-utils.js');
var userUtils = require('../lib/user-utils.js');
var log = require('../lib/logger.js');
var crypto = require('crypto');

var core;

function userHandler(action, callback) {
	var ref = sessionUtils.isInternalSession(action.session)? action.to : "me";
	core.emit("getUsers", {
		ref: ref,
		session: action.session
	}, function(meErr, response) {
		function done() {
			if (action.user.identities && action.user.identities.length) {
				if (!action.user.picture) action.user.picture = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(action.user.identities[0].substring(7)).digest('hex') + '/?d=retro';
			} else {
				action.user.picture = 'https://gravatar.com/avatar/default';
			}
			action.user.description = action.user.description || "";
			callback();
		}
		if (meErr || !response || !response.results || !response.results.length || !response.results[0]) {
			return callback(new Error("USER_NOT_INITED"));
		} else {
			action.old = response.results[0];
			action.from = response.results[0].id;
			core.emit("getUsers", {
				ref: action.user.id,
				session: "internal-loader"
			}, function(err, data) {
				if (err) return callback(err);
				if (userUtils.isGuest(action.from)) { // signup
					if (data && data.results && data.results.length) {
						return callback(new Error("ERR_USER_EXISTS"));
					}
				} else {
					if (!data || !data.results || !data.results.length) return callback(new Error("ERR_SAVING"));
					action.old = data.results[0]; // letting the authorized take care of things.
					return done();
				}
				
				if(action.user.id !== action.old.id && userUtils.isGuest(action.from)) {
					action.user.identities = action.old.identities;
					action.user.identities = action.user.identities.filter(function(ident) {
						if(/^guest/.test(ident)) return false;
						else return true;
					});
				}
				core.emit("getRooms", {
					session: "internal-loader",
					ref: action.user.id
				}, function(roomErr, rooms) {
					if (roomErr) return callback(roomErr);
					if (rooms && rooms.results && rooms.results.length) {
						return callback(new Error("ERR_USER_EXISTS"));
					}
					done();
				});
			});
		}
	});
}

module.exports = function(c) {
	core = c;
	core.on("user", function(action, next) {
		var userID;
		userHandler(action, function(err) {
			if(action.old && action.old.id) userID = action.old.id;
			else userID = action.user.id;
			
			if (err) return next(err);
			core.emit("getRooms", {
				hasOccupant: userID,
				session: "internal-loader"
			}, function(error, rooms) {
				log.d("user event occupant",error, rooms);
				if (error || !rooms || !rooms.results || !rooms.results.length) {
					action.occupantOf = [];
				} else {
					action.occupantOf = rooms.results;
				}
				action.user.createTime = action.old.createTime ? action.old.createTime : action.user.createTime;
				next();
			});
		});
	}, "loader");
};
