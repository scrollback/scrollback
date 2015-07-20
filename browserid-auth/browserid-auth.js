"use strict";

var config, log = require("../lib/logger.js"),
	crypto = require('crypto'),
	request = require("request"),
	core;

function browserAuth(action, callback) {
	var assertion;
	if (action.response || !action.auth || !action.auth.browserid) return callback();
	assertion = action.auth.browserid;

	log.d("assertion", assertion, config);
	request.post("https://verifier.login.persona.org/verify", {
		form: {
			assertion: assertion,
			audience: config.audience
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
			session: "internal-browserid-auth"
		}, function(e, user) {
			if(e) return callback(e);

			if (!user.results || user.results.length === 0) {
				action.old = action.user;
				action.user = {};
				action.user.id = action.old.id;
				action.user.type = "user";
				action.user.identities = [identity];
				action.user.picture = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(body.email).digest('hex') + '/?d=retro';
				action.user.params = {};
				action.user.guides = {};
				action.user.params.pictures = [action.user.picture];
                action.response = new Error("AUTH:UNREGISTERED");
				return callback();
			}

			if (action.user.id !== user.results[0].id) {
				action.old = action.user;
			} else {
				action.old = {};
			}

			action.user = user.results[0];
			callback();
		});
	});
}

module.exports = function(c, conf) {
	core = c;
	config = conf;
	core.on("init", browserAuth, "authentication");
};
