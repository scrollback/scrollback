var config = require("../config.js"),
	crypto = require('crypto'),
	request = require("request"),
	core,
	internalSession = Object.keys(config.whitelists)[0];

module.exports = function (c) {
	core = c;
	core.on("init", browserAuth, "authentication");
};

function browserAuth(action, callback) {
	var assertion;
	if (action.response || !action.auth || !action.auth.browserid) return callback();
	assertion = action.auth.browserid;
	request.post("https://verifier.login.persona.org/verify", {
		form: {
			assertion: assertion,
			audience: config.auth.audience
		}
	}, function(err, res, body) {
		var identity;
		if (err) {
			action.response = new Error("AUTH_FAIL_NETWORK/" + err.message);
			return callback();
		}
		try {
			body = JSON.parse(body);
		} catch (e) {
			action.response = new Error("AUTH_FAIL_SERVER/" + body);
			return callback();
		}
		
		if (body.status !== 'okay') {
			action.response = new Error("AUTH_FAIL/" + body.reason);
			return callback();
		}
		
		identity = "mailto:" + body.email;
		core.emit("getUsers", {
			identity: identity,
			session: internalSession
		}, function(err, user) {
			if (!user.results || user.results.length === 0) {
				action.user = {};
				action.user.identities = [identity];
				action.user.picture = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(body.email).digest('hex') + '/?d=retro';
				action.user.params = {};
				action.user.guides = {};
				action.user.params.pictures = [action.user.picture];
				return callback();
			}

			action.old = action.user;
			action.user = user.results[0];
			callback();
		});
	});
}
