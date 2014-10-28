var config = require("../config.js"),
	crypto = require('crypto'),
	request = require("request"),
	core,
	internalSession = Object.keys(config.whitelists)[0];

module.exports = function(c) {
	core = c;
	core.on("http/init", onInit, "setters");
	core.on("init", fbAuth, "authentication");
};

function onInit(payload, callback) {
	payload.push({
		get: {
			"/r/facebook/*": handlerRequest
		}
	});
	callback(null, payload);
}

function fbAuth(action, callback) {
	if (action.auth && action.auth.facebook) {
		request("https://graph.facebook.com/oauth/access_token?client_id=" + config.facebook.client_id +
			"&redirect_uri=https://" + config.http.host + "/r/facebook/return" +
			"&client_secret=" + config.facebook.client_secret +
			"&code=" + action.auth.facebook.code,
			function(err, res, body) {
				if (err) return callback(err);
				var queries = body.split("&"),
					i, l, token;
				for (i = 0, l = queries.length; i < l; i++) {
					if (queries[i].indexOf("access_token") >= 0) {
						token = queries[i].replace("access_token=", "");
						break;
					}
				}
				if (token) {
					request("https://graph.facebook.com/me?access_token=" + token, function(err, res, body) {
						var user;
						delete action.auth.facebook.code;
						if (err) return callback(err);
						try {
							user = JSON.parse(body);
							if (user.error) {
								return callback(new Error(user.error));
							}
							core.emit("getUsers", {
								identity: "mailto:" + user.email,
								session: internalSession
							}, function(err, data) {
								if (err || !data) return callback(err);

								if (!data.results.length) {
									action.user = {};
									action.user.identities = ["mailto:" + user.email];
									action.user.picture = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(user.email).digest('hex') + '/?d=retro';
									return callback();
								}
								action.old = action.user;
								action.user = data.results[0];
								callback();
							});
						} catch (e) {
							return callback(e);
						}
					});
				}
			});
	} else {
		callback();
	}
}

function handlerRequest(req, res) {
	var path = req.path.substring(12);
	path = path.split("/");
	if (path[0] == "login") {
		return res.render(__dirname + "/login.jade", {
			client_id: config.facebook.client_id,
			redirect_uri: "https://" + config.http.host + "/r/facebook/return"
		});
	}
	if (path[0] == "return") {
		return res.render(__dirname + "/return.jade", {});
	}
}
