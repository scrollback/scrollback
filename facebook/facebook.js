var config = require("../config.js"),
	request = require("request"),
	core,
	internalSession = Object.keys(config.whitelists)[0];

module.exports = function (c) {
	core = c;
	core.on("http/init", onInit, "setters");
	core.on("init", fbAuth, "authentication");
};

function onInit(payload, callback) {
	payload.facebook = {
		get: handlerRequest
	};
	callback(null, payload);
}

function fbAuth(action, callback) {
	if (action.response || !action.auth || !action.auth.browserid) return callback();
	
	request("https://graph.facebook.com/oauth/access_token?client_id=" + config.facebook.client_id +
		"&redirect_uri=https://" + config.http.host + "/r/facebook/return" +
		"&client_secret=" + config.facebook.client_secret +
		"&code=" + action.auth.facebook.code,
		function (err, res, body) {
			if (err) {
				action.response = err;
				return callback();
			}
		
			var queries = body.split("&"),
				i, l, token;
			for (i = 0, l = queries.length; i < l; i++) {
				if (queries[i].indexOf("access_token") >= 0) {
					token = queries[i].replace("access_token=", "");
					break;
				}
			}
			if (token) {
				request("https://graph.facebook.com/me?access_token=" + token, function (err, res, body) {
					var user;
					if (err) {
						action.response = err;
						return callback();
					}
					delete action.auth.facebook.code;
					try {
						user = JSON.parse(body);
						if (user.error) {
							action.response = err;
							return callback();
						}
						core.emit("getUsers", {
							identity: "mailto:" + user.email,
							session: internalSession
						}, function (err, data) {
							if (err || !data) {
								action.response = err;
								return callback();
							}

							if (!user.results || user.results.length === 0) {
								action.response = new Error("AUTH_UNREGISTERED/" + err.message);
								action.user.identities = ["mailto:"+ user.email];
								return callback();
							}

							action.old = action.user;
							action.user = user.results[0];
							callback();
						});
					} catch (e) {
						action.response = err;
						return callback();
					}
				});
			}
		});
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