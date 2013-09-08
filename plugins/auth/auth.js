var config = require("../../config.js"),
	request = require("request");

module.exports = function(core) {
	core.on('message', function(message, callback) {
		var assertion = message.browserid;
		delete message.browserid;
		if(message.type !== 'nick') return callback();
		if(!assertion) {
			// If there is no authentication info, make sure the new nick is a guest.
			if(!/^guest-/.test(message.ref)) message.ref = 'guest-' + message.ref;
			return callback();
		}
		request.post("https://verifier.login.persona.org/verify", { form: {
			assertion: assertion,
			audience: 'http://'+config.http.host
		}}, function(err, res, body) {
			if(err) return callback(new Error("AUTH_FAIL_NETWORK/" + err.message));
			try {
				body = JSON.parse(body);
			} catch(e) {
				return callback(new Error("AUTH_FAIL_SERVER/" + body));
			}
			if(body.status !== 'okay') {
				return callback(new Error("AUTH_FAIL/" + body.reason));
			}
			core.rooms({accounts: ["mailto:" + body.email]}, function(err, data) {
				if(err) return callback(new Error("AUTH_FAIL_DATABASE/" + err.message));
				if(data.length === 0) return callback(new Error("AUTH_UNREGISTERED"));
				message.user = data[0];
				message.ref = data[0].id;
				return callback();
			});
		});
	});
};