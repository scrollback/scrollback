"use strict";
var utils = require('../lib/app-utils.js');
var crypto = require('crypto');

var core;

function userHandler(action, callback) {
	core.emit("getUsers", {
		ref: "me",
		session: action.session
	}, function(meErr, response) {
		function done() {
			if (action.user.identities) {
				if (!action.user.picture) action.user.picture = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(action.user.identities[0].substring(7)).digest('hex') + '/?d=retro';
			} else {
				action.user.picture = 'https://gravatar.com/avatar/default';
			}
			action.user.description = action.user.description || "";
			callback();
		}
		if (meErr || !response || !response.results || !response.results.length) {
			return callback(new Error("USER_NOT_INITED"));
		} else {
			action.from = response.results[0].id;
			core.emit("getUsers", {
				ref: action.user.id,
				session: "internal-loader"
			}, function(err, data) {
				if (err) return callback(err);
				if (utils.isGuest(action.from)) { // signup
					if (data && data.results && data.results.length) {
						return callback(new Error("ERR_USER_EXISTS"));
					}
				} else {
					if (!data || !data.results || !data.results.length) return callback(new Error("ERR_SAVING"));
					action.old = data.results[0]; // letting the authorized take care of things.
					return done();
				}
				core.emit("getRooms", {
					session: "internal-loader",
					ref: action.user.id
				}, function(roomErr, rooms) {
					if (roomErr) return callback(roomErr);
					if (rooms && rooms.results && rooms.results.length) {
						return callback(new Error("ERR_USER_EXISTS"));
					}
					action.old = {};
					done();
				});

			});
		}
	});
}


module.exports = function(c) {
	core = c;
	core.on("user", function(action, next) {
		userHandler(action, function(err) {
			if (err) return next(err);
			action.user.createTime = action.old.createTime ? action.old.createTime : action.user.createTime;
			next();
		});
	}, "loader");
};
