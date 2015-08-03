"use strict";

var jwt = require('jsonwebtoken'),
	log = require('../lib/logger.js'),
	crypto = require('crypto'),
	core,
	keys, userUtils = require('../lib/user-utils.js'),
	config;

/* verifies and returns athentication data: */
var verify = (function() {
	return function(action, callback) {
		var availableKeys, i = 0;

		log.d("Verifying JWS init", action);

		if (!action.origin || !action.origin.host || !keys[action.origin.host]) return callback(false, {});
		availableKeys = keys[action.origin.host];

		log.d("JWS availbleKeys", availableKeys);

		function testKey() {
			console.log("JWS testing key", i);
			if (i === availableKeys.length) return callback(false);
			jwt.verify(action.auth.jws, Buffer(availableKeys[i], "base64"), { algorithm: 'HS512' }, function(err, decoded) {
				console.log("JWS verification result", err, decoded);
				if (!err && decoded) {
					return callback(true, decoded);
				}
				testKey(i++);
			});
		}

		if (availableKeys && availableKeys.length !== 0) {
			testKey(i);
		}
	};
}());

function checkCurrentRooms(user, host, callback) {
	core.emit("getRooms", {
		hasOccupant: user,
		session: "internal-jws"
	}, function(err, rooms) {
		var shouldAllow = true,
			i, l, res;
		if (err) return callback(new Error("AUTH_FAIL_DATABASE/" + err.message));
		if (!rooms.results || !rooms.results.length) res = [];
		else res = rooms.results;
		for (i = 0, l = res.length; i < l; i++) {
			if (res[i].guides && res[i].guides.allowedDomains) {
				if (res[i].guides.allowedDomains.indexOf(host) < 0) {
					shouldAllow = false;
					break;
				}
			}
		}
		return callback(null, shouldAllow);
	});
}

function jwsHandler(action, callback) {
	var host;
	if (!action.auth || !action.auth.jws) return callback();
	if (!userUtils.isGuest(action.user.id) && !action.user.allowedDomains) return callback();
	verify(action, function(isVerified, payload) {
		if (!isVerified) return callback(new Error("AUTH_FAIL:INVALID_TOKEN"));
		if (payload.iss !== action.origin.host) return callback(Error("AUTH_FAIL:INVALID_ISS " + payload.iss + ", Expected " + action.origin.host));

		core.emit("getUsers", {
			identity: "mailto:" + payload.sub,
			session: "internal-jws"
		}, function(err, res) {
			var user;
			if (err) return callback(new Error("AUTH_FAIL:DATABASE/" + err.message));
			host = action.origin.host;
			user = (res.results && res.results.length) ? res.results[0] : null;

			if (user) {
				if (config.global.su[user.id]) return callback(new Error("Oops.."));
				if (/^guest-/.test(action.user.id)) {
					checkCurrentRooms(action.user.id, host, function(e, shouldAllow) {
						if (e) return callback(e);
						if (!shouldAllow) {
							action.response = new Error("AUTH:RESTRICTED");
							callback();
						} else {
							action.old = action.user;
							action.user = user;
							action.user.allowedDomains = [host];
							return callback();
						}
					});
				} else {
					if (action.user.id === user.id) {
						if (!action.user.allowedDomains) action.user.allowedDomains = [];
						if (action.user.allowedDomains.indexOf(host) < 0) {
							action.user.allowedDomains.push(host);
						}
						callback();
					} else {
						//this state is when i am already logged in and a website gives me JSON signature and i cant do anything with it. so throwing error.
						callback(new Error("AUTH_FAIL:ALREADY_LOGGED_IN " + action.user.id + " Sign-in-attempt as " + user.id));
					}
				}
			} else {
				//			signup?
				if (/^guest-/.test(action.user.id)) {
					checkCurrentRooms(action.user.id, host, function(e, shouldAllow) {
						if (e) return callback(e);
						if (!shouldAllow) {
							action.response = new Error("AUTH:RESTRICTED");
							callback();
						} else {
							action.old = action.user;
							action.user = {};
							action.user.id = action.old.id;
							action.user.identities = ["mailto:" + payload.sub];
							action.user.picture = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(payload.sub).digest('hex') + '/?d=retro';
							action.user.params = {};
							action.user.params.pictures = [action.user.picture];
							action.response = new Error("AUTH:UNREGISTERED");
							return callback();
						}
					});
				} else {
					//				fail:
					callback(new Error("fail"));
				}
			}
		});
	});
}

module.exports = function(c, conf) {
	core = c;
	config = conf;
	keys = config.keys;
	core.on("init", jwsHandler, "authentication");
};
