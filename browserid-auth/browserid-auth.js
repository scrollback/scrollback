var config = require("../config.js"),
	log = require("../lib/logger.js"),
	crypto = require('crypto'),
	request = require("request"), core,
	internalSession = Object.keys(config.whitelists)[0];

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
            log("Network failure");
			return callback(new Error("AUTH_FAIL_SERVER/" + body));
		}
		if(body.status !== 'okay') {
			return callback(new Error("AUTH_FAIL/" + body.reason));
		}
		identity = "mailto:" + body.email;
		core.emit("getUsers",{identity: identity, session: internalSession}, function(err, user) {
			if(err) return callback(new Error("AUTH_FAIL_DATABASE/" + err.message));
			if(!user.results || user.results.length === 0) {
				action.user = {};
				action.user.identities = [identity];
                action.user.picture = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(body.email).digest('hex') + '/?d=monsterid';
				return callback();
			}
			action.old = action.user;
			action.user = user.results[0];
			callback();
		});
	});
}
