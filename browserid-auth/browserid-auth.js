var config = require("../config.js"),
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
	}, function (err, res, body) {
		var identity;

		if (err) {
			action.response = new Error("AUTH_FAIL_NETWORK/" + err.message);
		} else {
			try {
				body = JSON.parse(body);
				if (body.status !== 'okay') action.response = new Error("AUTH_FAIL/" + body.reason);
			} catch (e) {
				action.response = new Error("AUTH_FAIL_SERVER/" + body);
			}
		}
		if (action.response) return callback();
		identity = "mailto:" + body.email;
		core.emit("getUsers", {
			identity: identity,
			session: internalSession
		}, function (err, user) {
			if (err) {
				action.response = new Error("AUTH_FAIL_DATABASE/" + err.message);
				return callback();
			}

			if (!user.results || user.results.length === 0) {
				action.response = new Error("AUTH_UNREGISTERED/" + err.message);
				action.user.identities = [identity];
				return callback();
			}

			action.old = action.user;
			action.user = user.results[0];
			callback();
		});
	});
}