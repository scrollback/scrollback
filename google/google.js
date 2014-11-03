var core;
var log = require("../lib/logger.js");
var config = require("../config.js"),
	crypto = require('crypto'),
	request = require("request"),
	internalSession = Object.keys(config.whitelists)[0],
	core;
module.exports = function(c) {
	core = c;
	if (!config.google || !config.google.client_id || !config.google.client_secret) {
		console.log("Missing google params:");
		return;
	}
	core.on("http/init", function(payload, callback) {
		payload.push({
			get: {
				"/r/google/*": handlerRequest
			}
		});
		callback(null, payload);
	}, "setters");


	core.on("init", function(action, callback) {

		if (action.auth && action.auth.google) {
			request.post({
				uri: "https://accounts.google.com/o/oauth2/token",
				headers: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				body: require('querystring').stringify({
					code: action.auth.google.code,
					redirect_uri: "https://" + config.http.host + "/r/google/return",
					client_id: config.google.client_id,
					client_secret: config.google.client_secret,
					grant_type: "authorization_code"
				})
			}, function(err, res, body) {
				if (err) return callback(err);
				try {
					body = JSON.parse(body);
					request("https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + body.access_token, function(err, res, body) {
						if (err) return callback(err);
						try {
							body = JSON.parse(body);
							core.emit("getUsers", {
								identity: "mailto:" + body.email,
								session: internalSession
							}, function(err, data) {
								if (err || !data) return callback(err);

								if (!data.results.length) {
									action.user = {};
									action.user.identities = ["mailto:" + body.email];
									action.user.picture = body.picture;
									log.d("Google user object:",body.email);
									action.user.params = {
										pictures: [body.picture, 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(body.email).digest('hex') + '/?d=retro']
									};
									
									return callback();
								}
								action.old = action.user;
								action.user = data.results[0];
								if (action.user.params.pictures && action.user.params.pictures.indexOf(body.picture) < 0) {
									action.user.params.pictures.push(body.picture);
									core.emit("user", {
										type: "user",
										to: action.user.id,
										user: action.user,
										session: internalSession
									}, function(err, action) {
										console.log("Action done:", err, action);
									});
								}
								
								callback();
							});
						} catch (e) {
							return callback(e);
						}
					});
				} catch (e) {
					return callback(e);
				}
			});

		} else {
			callback();
		}

	}, "authentication");
};

function handlerRequest(req, res) {
	var path = req.path.substring(3);
	path = path.split("/");
	if (path[0] == "google") {
		if (path[1] == "login") {
			console.log("Google loging:");
			return res.render(__dirname + "/login.jade", {
				client_id: config.google.client_id,
				redirect_uri: "https://" + config.http.host + "/r/google/return"
			});
		} else if (path[1] == "return") {
			return res.render(__dirname + "/return.jade", {});
		}
	}

}
