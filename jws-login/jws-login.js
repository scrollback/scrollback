var config = require("../config.js"),
	crypto = require('crypto'),
	core,
	internalSession = Object.keys(config.whitelists)[0];

module.exports = function (c) {
	core = c;
	core.on("init", jws, "authentication");
};

function checkCurrentRooms(user, domain, callback) {
	core.emit("getRooms", {
		hasOcuppant: user,
		session: internalSession
	}, function (err, rooms) {
		var shouldAllow = true,
			i, l, res;
		if (err) return callback(new Error("AUTH_FAIL_DATABASE/" + err.message));
		if (!rooms.results || !rooms.results.length) res = [];
		for (i = 0, l = res.length; i < l; i++) {
			if (res[i].guides && res[i].allowedDomains) {
				if (res[i].guides.allowedDomains.indexOf(domain) < 0) {
					shouldAllow = false;
					break;
				}
			} else {
				shouldAllow = false;
				break;
			}
		}
		return callback(null, shouldAllow);
	});
}

function jws(action, callback) {
	var domain;
	if (!action.auth || !action.auth.jws) return callback();
	core.emit("getUsers", {
		identity: action.auth.jws,
		session: internalSession
	}, function (err, res) {
		var user;
		if (err) return callback(new Error("AUTH_FAIL_DATABASE/" + err.message));
		domain = action.origin.domain;
		user = (!res.results && res.results.length) ? res[0] : null;

		if (user) {
			if (/^guest-/.test(action.user.id)) {
				checkCurrentRooms(action.user.id, domain, function (err, shouldAllow) {
					if (err) return callback(err);
					if (!shouldAllow) {
						//					   ask for full login
						callback(new Error("fail"));
					} else {
						action.old = action.user;
						action.user = user;
						action.allowedDomains = [domain];
					}
				});
			} else {
				if (action.user.id == user.id) {
					if (action.user.allowedDomains) {
						action.user.allowedDomains.push(domain);
					} else {
						action.user.allowedDomains = [domain];
					}
				} else {
					//					init fails.
					callback(new Error("fail"));
				}
			}
		} else {
			//			signup?
			if (/^guest-/.test(action.user.id)) {
				checkCurrentRooms(action.user.id, domain, function (err, shouldAllow) {
					if (err) return callback(err);
					if (!shouldAllow) {
						//					   ask for full login
					} else {
						action.old = action.user;
						action.user = {};
						action.user.identities = [action.auth.jws];
						action.user.picture = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(action.auth.jws).digest('hex') + '/?d=retro';
						return callback();
					}
				});
			} else {
				//				fail:
				callback(new Error("fail"));
			}

		}
	});
}