var config = require("../../config.js"),
	request = require("request");

module.exports = function(core) {
	core.on('message', function(message, callback) {
		if(message.type !== 'nick' || !message.browserid) return callback();
		request.post("https://verifier.login.persona.org/verify", { form: {
			assertion: message.browserid,
			audience: 'http://'+config.http.host
		}}, function(err, res, body) {
			if(err) return callback(new Error("AUTH_FAIL_NETWORK/" + err.message));
			try {
				body = JSON.parse(body);
			} catch(e) {
				return callback(new Error("AUTH_FAIL_SERVER/" + e.message));
			}
			if(body.status !== 'okay') {
				return callback(new Error("AUTH_FAIL/" + body.reason));
			}
			core.room;
		});
	});
};