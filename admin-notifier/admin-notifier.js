var log = require("../lib/logger.js");
var config = require('../config.js');
var nodemailer = require('nodemailer');
var redisProxy = require('../lib/redisProxy.js');
var origins = {};
var url = require("url");

var emailConfig = config.email, digestJade;
var core;


module.exports = function(core) {
	if (!emailConfig) {
		return;
	}

	var transport = nodemailer.createTransport("SMTP", {
		host: "email-smtp.us-east-1.amazonaws.com",
		secureConnection: true,
		port: 465,
		auth: emailConfig.auth
	});

	function send(from,to,subject,html) {
		var email = {
			from: from,
			to: to,
			subject: subject,
			html: html
		};
		transport.sendMail(email, function(error) {
			if(!error){
				log('Test message sent successfully!');
			}
			else{
				log("error in sending email: ",error);
				log("retrying......");
				setTimeout(function(){
					send(email.from, email.to, email.subject, email.html);
				},15*60*1000);
			}
		});
	}

	core.on("message", function(message, callback) {
		var originURL;
		callback();
		if(message && message.origin && message.origin.location) {
			originURL = url.parse(message.origin.location);
			message.to.forEach(function(room) {
                redisProxy.get("DEPLOYMENT:"+room+":"+originURL.host, function(err, data) {
                    if(data == null || typeof data.length=="undefined") {
                        log("sending email");
                        send(config.originnotify.from, config.originnotify.to, "New Deployment:"+originURL.host, "room:"+message.to+" deployed at "+message.origin.location);
                    }
                    redisProxy.set("DEPLOYMENT:"+room+":"+originURL.host, message.origin.location);
                });
            });
		}
	}, "watcher");
};
