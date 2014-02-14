var log = require("../lib/logger.js");
var passport = require('passport');
var fs = require("fs");
var db = require("../lib/mysql.js");
var Twit = require('twit');
var guid = require("../lib/guid.js");
var config = require('../config.js');
var redis = require("redis").createClient();
var TwitterStrategy = require('passport-twitter').Strategy;
var twitterConsumerKey = config.twitter.consumerKey;
var twitterConsumerSecret = config.twitter.consumerSecret;
var callbackURL = config.twitter.callbackURL;
var core;
var expireTime = 10*60;//expireTime for twitter API key...
var timeout  = 1000*60;//search Interval
var currentConnections = {};
var userData = {};
module.exports = function(coreObj) {
	if (config.twitter && config.twitter.consumerKey && config.twitter.consumerSecret) {
		log("twitter app started");
		core = coreObj;
		init();
		fs.readFile(__dirname + "/twitter.html", "utf8", function(err, data){
			if(err)	throw err;
			core.on("http/init", function(payload, callback) {
				payload.twitter = {
					config: data,
					get: function(req,res,next) {	
						getRequest(req,res,next);
					}
				};
				callback(null, payload);
			}, "setters");
		});
		core.on("room", function(room, callback){
			log("twitter room obj", JSON.stringify(room));
			if (room.type == 'room' && room.params && room.params.twitter) {
				addTwitterTokens(room, callback);			
			}
			else {
				callback();
			}
			log("twitter", room);
		},"gateway");
	}
	else {
		log("twitter is not enabled");
	}
	
	
};

function addTwitterTokens(room, callback) {
	log("adding twitter tokens.", room);
	var multi = redis.multi();
	multi.get("twitter:userData:token:" + room.owner);
	multi.get("twitter:userData:tokenSecret:" + room.owner);
	multi.get("twitter:userData:profile:" + room.owner);
	multi.exec(function(err, replies) {
		if (err) {
			log("some redis Error");
			callback(err);
		}
		else {
			if (room.accounts) {
				var  isTwitter = false;
				room.accounts.forEach(function (account) { 
					if (account.gateway === 'twitter') {
						isTwitter = true;
						if (replies[0] && replies[1] && replies[2]) {
							log("adding new values....");
							account.params.token = replies[0];
							account.params.tokenSecret = replies[1];
							account.params.profile = replies[2];
							account.params.tags = account.params.tags.trim();
							callback();
						}
						else {//new values are not present in redis.. copy old
							copyOld();
						}
					}
				});
				if (!isTwitter) {
					//disconnect(room);
					callback("twitter login error");
				}
			} else {
				//disconnect(room);
				callback("twitter login error");
			}
		}
	});
	function copyOld() {
		log("copyOld");
		var acc;//old account
		room.old.accounts.forEach(function(account) {
			if (account.gateway === "twitter") {
				if (account.params.token && account.params.tokenSecret && account.params.profile) {
					acc = account;	
				}
			}
		});
		if(acc) {
			//old account token should be copied
			var ta;
			var isTwitter = false;
			room.accounts.forEach(function (account) { 
				if (account.gateway === 'twitter' && !account.params.token) {
					account.params.token = acc.params.token;
					account.params.tokenSecret = acc.params.tokenSecret;
					account.params.profile = acc.params.profile;
					account.params.tags = account.params.tags.trim();
					ta = account;
					isTwitter = true;
					callback();
				}
				
			});
			if (!twitter) {
				callback("Error in twitter login");
			}
		}
		else {
			callback("Error in twitter login");
		}
	}
}

//kamalkishor1991 - 1930219950-w6KJdXDfGeS2FdJ6UtzqAInL8YO8aBwdi2DOFpM",
//"tokenSecret":"S3Pm1Fp1eYSBrPLfCyyNvVvfUVjqr2tPIGrxss66NtBPp
//kamalkishor1234- token: '2308231086-4ZUmxV4wnuky02c80WYFqnTFmqW3WGOHy8MAxr7',
//tokenSecret: '8i76KUNZNl7FTgMQoKjsMnj2r0kPkZj0bDqmyVhfLpk2i'
//
function init() {
	setInterval(tweet, timeout);
	//setTimeout(init(), 5000 * 10);
	
	
}


function tweet() {
	db.query("SELECT * FROM `accounts` WHERE `gateway`='twitter'", function(err, data) {
		if(err) throw "Cannot retrieve twitter accounts";
		
		log("all data = ", data);
		data.forEach(function(account) {
			log("connecting for room...", account.room);
			account.params = JSON.parse(account.params);
			fetchTweets(account);
		});
	});
}
/**
 *Connect with twitter
 *1. if tag is empty will not connect
 *https://dev.twitter.com/docs/api/1.1/get/application/rate_limit_status
 */
function fetchTweets(account) {
	
	if (account.params && account.params.tags !== "") {
		log("connecting for account", account);
		var twit;
		twit = new Twit({
			consumer_key: twitterConsumerKey ,
			consumer_secret: twitterConsumerSecret,
			access_token:  account.params.token,
			access_token_secret: account.params.tokenSecret
		});
		log("calling room,", account.room);
		twit.get(
			'search/tweets', {
				q: account.params.tags,
				count: 100
			}, function(err, reply) {
				if (err) {
					log("error", err);
				}
				else {
					log("reply= ", JSON.stringify(reply));
					sendMessages(reply, account);
					log("reply...", account.room);
					
				}
			}	
		);
	}
	
	
}

/**
 *Send selected messages
 *@param {object} Twitter reply Object
 */
function sendMessages(replies, account) {
	replies.statuses.forEach(function(r) {
		var message = {
			id: guid(),
			type: "text",
			text: r.text,
			origin: "twitter",
			from: "guest-sb-twitter",
			to: account.room,
			time: new Date().getTime()
		};
		core.emit("message", message);
	});
}

/**** get request handler *******/
/**
 *  "/r/twitter/login" for login
 *   "/r/twitter/"
 *   "r/twitter/auth/twitter/callback/{username}" callback
 */
function getRequest(req, res, next) {
	var path = req.path.substring(11);// "/r/twitter/"
	log("path " , path , req.url ," session" , req.session.user);
	var ps = path.split('/');
	if (ps[0] && ps[0] === "login") {
		//passport.initialize();
		log("login request...");
		passport.serializeUser(function(user, done) {
			done(null, user);
		});
	 
		passport.deserializeUser(function(obj, done) {
			done(null, obj);
		});
		passport.use(new TwitterStrategy({
				consumerKey: twitterConsumerKey,
				consumerSecret: twitterConsumerSecret,
				callbackURL: callbackURL +"/" + req.session.user.id
			},
			function(token, tokenSecret, profile, done) {
				log("tokens", token, tokenSecret);
				userData[req.session.user.id] = {token: token,tokenSecret: tokenSecret, profile : profile};
				
				var multi = redis.multi();
				multi.setex("twitter:userData:token:" + req.session.user.id, expireTime, token);
				multi.setex("twitter:userData:tokenSecret:" + req.session.user.id, expireTime, tokenSecret);
				multi.setex("twitter:userData:profile:" + req.session.user.id, expireTime, JSON.stringify(profile));
				multi.exec(function(err,replies) {
					log("user data added-----", replies);	
				});
				done(null, profile);
			}
		));
		
		passport.authenticate('twitter')(req, res, next);
	}
	else if (ps.length >= 3 && ps[0] === "auth" && ps[1] === "callback") {
		var auth = passport.authenticate('twitter', {failureRedirect: '/r/twitter/login' });
		auth(req, res, function(err) {
			log("ret ", err , ps[2] + "," , req.session.user.id);
			if (userData[req.session.user.id]) {
				res.render(__dirname + "/login.jade", userData[req.session.user.id]);
				delete userData[req.session.user.id];
			}
			else {
				next();
			}
		});
	}
	else {
		next();
	}
}

/**** get request handler *******/







