var core;
var log = require("../lib/logger.js");
var config,
	crypto = require('crypto'),
	request = require("request"),
	core;
module.exports = function(c, conf) {
	core = c;
	config = conf;

	if (!config.client_id || !config.client_secret) {
		log.d("Missing google params:");
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

	function loginUser(token, action, callback) {
		request("https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + token,
			function(err, res, body) {
				var gravatar, googlePic, sendUpdate = false;
				if (err) return callback(err);
				try {
					body = JSON.parse(body);

					if (!body.email) {
						log.d("Google + Error Action received: ", action);
						log.e("Google + login Error: ", JSON.stringify(body));
						return callback(new Error("Error in saving USER"));
					}
					gravatar = 'https://gravatar.com/avatar/' +
						crypto.createHash('md5').update(body.email).digest('hex') + '/?d=retro';
					googlePic = body.picture;
					core.emit("getUsers", {
						identity: "mailto:" + body.email,
						session: "internal-google"
					}, function(err, data) {
						if (err || !data) return callback(err);

						if (!data.results.length) {
							action.user = {};
							action.user.id = action.old.id;
							action.user.identities = ["mailto:" + body.email];
							action.user.picture = body.picture;
							log.d("Google user object:", body.email);
							action.user.params = {
								pictures: [googlePic, gravatar]
							};

							return callback();
						}

						action.old = action.user;
						action.user = data.results[0];
						if (!action.user.params.pictures) action.user.params.pictures = [];

						if (action.user.params.pictures.indexOf(googlePic) < 0) {
							action.user.params.pictures.push(googlePic);
							sendUpdate = true;
						}
						if (action.user.params.pictures.indexOf(gravatar) < 0) {
							action.user.params.pictures.push(gravatar);
							sendUpdate = true;
						}
						if (sendUpdate) {
							core.emit("user", {
								type: "user",
								to: action.user.id,
								user: action.user,
								session: "internal-google"
							}, function(err, action) {
								log.d("Adding picture on sign-in: ", err, action);
							});
						}

						callback();
					});
				} catch (e) {
					return callback(e);
				}
			});
	}

	core.on("init", function(action, callback) {

		if (action.auth && action.auth.google && action.auth.google.code) {
			request.post({
				uri: "https://accounts.google.com/o/oauth2/token",
				headers: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				body: require('querystring').stringify({
					code: action.auth.google.code,
					redirect_uri: "https://" + config.global.host + "/r/google/return",
					client_id: config.client_id,
					client_secret: config.client_secret,
					grant_type: "authorization_code"
				})
			}, function(err, res, tokenBody) {
				if (err) return callback(err);
				try {
					tokenBody = JSON.parse(tokenBody);
					var token = tokenBody.access_token;
					if (token) {
						loginUser(token, action, callback);
					}
				} catch (e) {
					return callback(e);
				}
			});

		} else if (action.auth && action.auth.google && action.auth.google.token) {
			loginUser(action.auth.google.token, action, callback);
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
			return res.render(__dirname + "/login.jade", {
				client_id: config.client_id,
				redirect_uri: "https://" + config.global.host + "/r/google/return"
			});
		} else if (path[1] == "return") {
			return res.render(__dirname + "/return.jade", {});
		}
	}

}