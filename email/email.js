var config;
var log = require("../lib/logger.js");
var redis;
var emailDigest;
var initMailSending;
var sendPeriodicMails;
var trySendingToUsers;
var core;
var timeout = 30 * 1000; // for debuging only

module.exports = function(coreObject, conf) {
	config = conf;
	core = coreObject;

	emailDigest = require('./emailDigest.js');
	initMailSending = emailDigest.initMailSending; //function
	sendPeriodicMails = emailDigest.sendPeriodicMails; //function
	trySendingToUsers = emailDigest.trySendingToUsers; //function.

	redis = require('redis').createClient();
	redis.select(config.redisDB);

	require('./welcomeEmail.js')(core, conf);
	emailDigest.init(core, config);
	if (config.auth) {
		core.on('text', function(message, callback) {
			callback();
			if (message.type === "text") {
				addMessage(message);
			}
		}, "gateway");
		if (config.debug) {
			setInterval(sendPeriodicMails, timeout);
			setInterval(trySendingToUsers, timeout / 8);
		}
	} else {
		log("email module is not enabled");
	}
};

function getExpireTime() {
		if (config.debug) {
			return timeout * 2;
		} else return 2 * 24 * 60 * 60; //2 days//TODO move this to config.
	}
	/**
	 *Push message into redis
	 *If threads is not defined then it will not send mentions email.
	 *and not add data into redis.
	 */
function addMessage(message) {
	var room = message.to;
	if (config.debug) log("email -", message);
	if (message.thread && message.thread[0]) {
		var label = message.thread[0].id;
		var title = message.thread[0].title;
		var multi = redis.multi();
		multi.zadd("email:label:" + room + ":tags", message.time, label); // email: roomname : tags is a sorted set
		multi.incr("email:label:" + room + ":" + label + ":count");
		multi.expire("email:label:" + room + ":" + label + ":count", getExpireTime());
		if (title) multi.set("email:label:" + room + ":" + label + ":title", title);
		multi.expire("email:label:" + room + ":" + label + ":title", getExpireTime());
		multi.lpush("email:label:" + room + ":" + label + ":tail", JSON.stringify(message)); //last message of label
		multi.ltrim("email:label:" + room + ":" + label + ":tail", 0, 2);
		multi.expire("email:label:" + room + ":" + label + ":tail", getExpireTime());
		multi.exec(function(err, replies) {
			log("added message in redis", err, replies);
		});
		if (message.mentions) {
			message.mentions.forEach(function(username) {
				var multi2 = redis.multi();

				multi2.sadd("email:mentions:" + room + ":" + username, JSON.stringify(message), function(err, res) {
					if (err) log.i(err, res);
				});

				multi2.set("email:" + username + ":isMentioned", true); // mentioned indicator for username
				multi2.exec(function(err, replies) {
					log("added mention ", replies);
					if (!err) {
						core.emit("getUsers", {
							ref: username,
							session: "internal-email"
						}, function(err, r) {
							if (!err && r.results && r.results[0]) {
								var user = r.results[0];
								if (!user.params.email || (user.params.email && user.params.email.notifications)) {
									log("sending mention email to user", username);
									initMailSending(username);
								} else log("Not sending email to user ", username);
							}
						});

					}
				}); // mention is a set)
			});
		}
	}

}
