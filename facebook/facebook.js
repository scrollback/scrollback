var config,
	crypto = require('crypto'),
	request = require("request"),
	log = require('../lib/logger.js'),
	core;

module.exports = function(c, conf) {
	core = c;
	config = conf;
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

function loginUser(token, action, callback) {
	request("https://graph.facebook.com/me?access_token=" + token, function(err, res, body) {
		var user, gravatar, fbpic, sendUpdate = false;
		delete action.auth.facebook.code;
		if (err) return callback(err);
		try {
			user = JSON.parse(body);
			if (user.error || !user.email) {
				if (!user.email) log.e("Facebook login failed: ", body);
				return callback(new Error(user.error || "Error in facebook sign in."));
			}
			core.emit("getUsers", {
				identity: "mailto:" + user.email,
				session: "internal-facebook"
			}, function(err, data) {
				if (err || !data) return callback(err);

				if (!data.results.length) {
					action.old = {};
					action.user = {};
					action.user.id = action.old.id;
					action.user.identities = ["mailto:" + user.email];
					fbpic = action.user.picture = "https://graph.facebook.com/" + user.id + "/picture?type=square";
					gravatar = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(user.email).digest('hex') + '/?d=retro';

					action.user.params = {
						pictures: [fbpic, gravatar]
					};
					return callback();
				}

				action.old = action.user;
				action.user = data.results[0];
				if (!action.user.params.pictures) action.user.params.pictures = [];

				fbpic = "https://graph.facebook.com/" + user.id + "/picture?type=square";

				try {
					gravatar = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(user.email).digest('hex') + '/?d=retro';
				} catch (e) {
					log.d(action, action.old);
					log.i("Error creating the gravatar image.", "\n" + body);
				}

				if (action.user.params.pictures.indexOf(fbpic) < 0) {
					action.user.params.pictures.push(fbpic);
					sendUpdate = true;
				}
				if (gravatar && action.user.params.pictures.indexOf(gravatar) < 0) {
					action.user.params.pictures.push(gravatar);
					sendUpdate = true;
				}

				if (sendUpdate) {
					core.emit("user", {
						type: "user",
						to: action.user.id,
						user: action.user,
						session: "internal-facebook"
					}, function(err, action) {
						log.d("Action done:", err, action);
					});
				}

				callback();
			});
		} catch (e) {
			return callback(e);
		}
	});
}

function fbAuth(action, callback) {
	if (!action.response && action.auth && action.auth.facebook && action.auth.facebook.code) {
		request("https://graph.facebook.com/oauth/access_token?client_id=" + config.client_id +
			"&redirect_uri=https://" + config.global.host + "/r/facebook/return" +
			"&client_secret=" + config.client_secret +
			"&code=" + action.auth.facebook.code,
			function(err, res, body) {
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
					loginUser(token, action, callback);
				}
			});
	} else if (action.auth && action.auth.facebook && action.auth.facebook.token) {
		loginUser(action.auth.facebook.token, action, callback);
	} else {
		callback();
	}
}

function handlerRequest(req, res, next) {
	var path = req.path.substring(3);
	path = path.split("/");
	if (path[0] === "facebook") {
		if (path[1] === "login") {
			return res.render(__dirname + "/login.jade", {
				client_id: config.client_id,
				redirect_uri: "https://" + config.global.host + "/r/facebook/return"
			});
		}
		if (path[1] === "return") {
			return res.render(__dirname + "/return.jade", {});
		}
	} else {
		next();
	}
}
