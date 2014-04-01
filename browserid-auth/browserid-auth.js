var config = require("../config.js"),
	name = require("../lib/generate.js").word,
	log = require("../lib/logger.js"),
	request = require("request"), core;

module.exports = function(c) {
	core = c;
	core.on("init", browserAuth, "authentication");
};

function browserAuth(action, callback) {
	var assertion;
	if(!action.auth || !action.auth.browserid) return callback();
	assertion = action.auth.browserid;
	request.post("https://verifier.login.persona.org/verify", { form: {
		assertion: assertion,
		audience: config.auth.audience
	}}	, function(err, res, body) {
		var identity;
		if(err) return callback(new Error("AUTH_FAIL_NETWORK/" + err.message));
		try {
			body = JSON.parse(body);
		} catch(e) {
			return callback(new Error("AUTH_FAIL_SERVER/" + body));
		}
		if(body.status !== 'okay') {
			return callback(new Error("AUTH_FAIL/" + body.reason));
		}

		identity = "mailto:" + body.email;
		core.emit("getUsers",{identity: identity}, function(err, user) {
			if(err) return callback(new Error("AUTH_FAIL_DATABASE/" + err.message));
			if(data.length === 0) {
				action.user.identities = [identity];
				return callback();
			}
			action.user = user[0];
			callback();

		});
	});
}