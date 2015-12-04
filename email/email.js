"use strict";

var config;
var log = require("../lib/logger.js");
var redis;
var emailDigest;
var unsubscribe; 
var initMailSending;
var sendPeriodicMails;
var trySendingToUsers;
var core;
var timeout = 30 * 1000; // for debuging only


function getMessageObject(message) {
	return JSON.stringify({
		id: message.id,
		type: "text",
		text: message.text,
		from: message.from,
		to: message.to,
		time: message.time,
		thread: message.thread,
		mentions: message.mentions,
		tags: message.tags
	});
}


function getExpireTime() {
	if (config.debug) {
		return timeout*2;
	}
	else return 2*24*60*60;//2 days//TODO move this to config.
}


/**
 *Push message into redis
 *If threads is not defined then it will not send mentions email.
 *and not add data into redis.
 */
function addMessage(message){
    var room = message.to;
    log.d("email -"  , message);
    if (message.thread) {
        var thread = message.thread;
        var title = message.title || "";
		var multi = redis.multi();
		multi.zadd("email:thread:" + room + ":threads" ,message.time , thread); // email: roomname : threads is a sorted set
		multi.incr("email:thread:" + room + ":" + thread + ":count");
		multi.expire("email:thread:" + room + ":" + thread + ":count" , getExpireTime());
		if(title) multi.set("email:thread:" + room + ":" + thread + ":title", title);
		multi.expire("email:thread:" + room + ":" + thread + ":title" , getExpireTime());
		multi.lpush("email:thread:" + room + ":" + thread +":tail", getMessageObject(message));//last message of thread
		multi.ltrim("email:thread:" + room + ":" + thread +":tail", 0, 2);
		multi.expire("email:thread:" + room + ":" + thread + ":tail" , getExpireTime());
		multi.exec(function(err,replies) {
			log.d("added message in redis" , err, replies);
		});
        if (message.mentions) {
            message.mentions.forEach(function(username) {
				var multi2 = redis.multi();

				multi2.sadd("email:mentions:" + room + ":" + username, getMessageObject(message), function(err, res) {
					if (err) log.i(err, res);
				});

				multi2.set("email:" + username + ":isMentioned", true); // mentioned indicator for username
				multi2.exec(function(err,replies) {
					log("added mention ", replies);
					if (!err) {
						core.emit("getUsers", {ref: username, session: "internal-email"}, function(e, r) {
							if(!e && r.results && r.results[0]) {
								var user = r.results[0];
								if(!user.params.email || (user.params.email && user.params.email.notifications)) {
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


module.exports = function(coreObject, conf) 
{
	config = conf;
	core = coreObject;
	emailDigest = require('./emailDigest.js');
	require('./unsubscribe.js')(core, config);
	
    initMailSending = emailDigest.initMailSending;//function
	sendPeriodicMails = emailDigest.sendPeriodicMails;//function
	trySendingToUsers = emailDigest.trySendingToUsers;//function.

	redis = require('redis').createClient();
	redis.select(config.redisDB);

	require('./welcomeEmail.js')(core, conf);
    emailDigest.init(core, config);
	if (config.auth) {
		core.on('text', function(message, callback) {
			callback();
			addMessage(message);
		}, "gateway");
		if (config.debug) {
			setInterval(sendPeriodicMails, timeout);
			setInterval(trySendingToUsers,timeout/8);
		}
	}
	else {
		log("email module is not enabled");
	}
};
