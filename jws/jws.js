var jwt = require('jsonwebtoken'),
	crypto = require('crypto'), core,
	keys, utils = require('../lib/app-utils.js'), config;


module.exports = function (c, conf) {
	core = c;
    config = conf;
    keys = config.keys;
	core.on("init", jwsHandler, "authentication");
};

function checkCurrentRooms(user, domain, callback) {
	core.emit("getRooms", {
		hasOccupant: user,
		session: "internal-jws"
	}, function (err, rooms) {
		var shouldAllow = true,
			i, l, res;
		if (err) return callback(new Error("AUTH_FAIL_DATABASE/" + err.message));
		if (!rooms.results || !rooms.results.length) res = [];
		else res = rooms.results;
		for (i = 0, l = res.length; i < l; i++) {
			if (res[i].guides && res[i].guides.allowedDomains) {
				if (res[i].guides.allowedDomains.indexOf(domain) < 0) {
					shouldAllow = false;
					break;
				}
			}
		}
		return callback(null, shouldAllow);
	});
}

function jwsHandler(action, callback) {
	var domain;
	if (!action.auth || !action.auth.jws) return callback();
	if(!utils.isGuest(action.user.id) && !action.user.allowedDomains) return callback();
	verify(action, function(isVerified, payload) {
		if(!isVerified) return callback(new Error("AUTH_FAIL: INVALID_TOKEN"));
		if(payload.iss != action.origin.domain) return callback("AUTH_FAIL:INVALID_ISS");

		core.emit("getUsers", {
			identity: "mailto:"+payload.sub,
			session: "internal-jws"
		}, function (err, res) {
			var user;
			if (err) return callback(new Error("AUTH_FAIL_DATABASE/" + err.message));
			domain = action.origin.domain;
			user = (res.results && res.results.length) ? res.results[0] : null;

			if (user) {
                if(config.global.su[user.id]) return callback(new Error("Oops.."));
				if (/^guest-/.test(action.user.id)) {
					checkCurrentRooms(action.user.id, domain, function (err, shouldAllow) {
						if (err) return callback(err);
						if (!shouldAllow) {
							action.response = new Error("AUTH:RESTRICTED");
							callback();
						} else {
							action.old = action.user;
							action.user = user;
							action.user.allowedDomains = [domain];
							return callback();
						}
					});
				} else {
					if (action.user.id == user.id) {
						if (action.user.allowedDomains) {
							action.user.allowedDomains.push(domain);
						} else {
							action.user.allowedDomains = [domain];
						}
						callback();
					} else {
						//this state is when i am already logged in and a website gives me JSON signature and i cant do anything with it. so throwing error.
						callback(new Error("fail"));
					}
				}
			} else {
				//			signup?
				if (/^guest-/.test(action.user.id)) {
					checkCurrentRooms(action.user.id, domain, function (err, shouldAllow) {
						if (err) return callback(err);
						if (!shouldAllow) {
							action.response = new Error("AUTH:RESTRICTED");
							callback();
						} else {
							action.old = action.user;
							action.user = {};
							action.user.identities = [payload.sub];
							action.user.picture = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(payload.sub).digest('hex') + '/?d=retro';
							action.user.params = {};
							action.user.params.pictures = [action.user.picture];
							action.response = new Error("AUTH:UNREGISTRED");
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




var verify = (function() {
	return function(action, callback) {
		var availableKeys, i=0;
		if(!action.origin || !action.origin.domain || !keys[action.origin.domain]) return callback(false, {});
		availableKeys = keys[action.origin.domain];
		console.log("Available keys.",availableKeys);
		function testKey() {
			if (i == availableKeys.length) return callback(false);
			jwt.verify(action.auth.jws, availableKeys[i], function(err, decoded) {
				console.log("++++++++++++++++++++++",err, decoded);
				if (!err && decoded) {
					return callback(true, decoded);
				}
				testKey(i++);
			});
		}

		if(availableKeys && availableKeys.length !== 0) {
			testKey(i);
		}
	};
}());
/* verifies and returns athentication data: */

