var config = require('../config.js');
var log = require("../lib/logger.js");
var db = require('../lib/mysql.js');
var send = require('./sendEmail.js');
var fs=require("fs"),jade = require("jade");
var redis = /*require("redis").createClient();*/require('../lib/redisProxy.js').select(5);//TODO move this to config.
var emailDigest = require('./emailDigest.js');
var initMailSending = emailDigest.initMailSending;//function
var sendPeriodicMails = emailDigest.sendPeriodicMails;//function
var trySendingToUsers = emailDigest.trySendingToUsers;//function.
var emailConfig = config.email;
var core;
var debug = emailConfig.debug;
var timeout = 3*1000;//for debuging only

module.exports = function(coreObject) {
	core = coreObject;
    if(!debug) log = log.tag("mail");
    emailDigest.init();
	if (config.email && config.email.auth) {
		core.on('text', function(message, callback) {
			callback();
			if(message.type === "text"){
				addMessage(message);
			}
		}, "gateway");
		if (emailConfig.debug) {
		   setInterval(sendPeriodicMails, timeout);
		   setInterval(trySendingToUsers,timeout/8);
		}
	}
	else {
		log("email module is not enabled");
	}
};

function getExpireTime() {
	if (emailConfig.debug) {
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
    if(emailConfig.debug) log("email -"  , message);
    if (message.threads && message.threads[0]) {
        var label = message.threads[0].id;
        var title = message.threads[0].title;
        redis.multi(function(multi) {
			multi.zadd("email:label:" + room + ":labels" ,message.time , label); // email: roomname : labels is a sorted set
			multi.incr("email:label:" + room + ":" + label + ":count");
			multi.expire("email:label:" + room + ":" + label + ":count" , getExpireTime());
			multi.set("email:label:" + room + ":" + label + ":title", title);
			multi.expire("email:label:" + room + ":" + label + ":title" , getExpireTime());
			multi.lpush("email:label:" + room + ":" + label +":tail", JSON.stringify(message));//last message of label
			multi.ltrim("email:label:" + room + ":" + label +":tail", 0, 2);
			multi.expire("email:label:" + room + ":" + label + ":tail" , getExpireTime());
			multi.exec(function(err,replies) {
				log("added message in redis" , err, replies);
			});
		});
        if (message.mentions) {
            message.mentions.forEach(function(username) {
                redis.multi( function(multi) {
					multi.sadd("email:mentions:" + room + ":" + username , JSON.stringify(message));//mentioned msg
					multi.set("email:" + username + ":isMentioned", true);//mentioned indicator for username
					multi.exec(function(err,replies) {
						logMail("added mention ", replies);
						if (!err) {
							initMailSending(username);
						}
					});//mention is a set)
            	});
			});
        }
    }   
}
