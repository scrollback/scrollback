var log = require("../lib/logger.js");
var logTwitter = log;
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
var debug = config.twitter.debug;
var core;
var expireTime = 10 * 60;//expireTime for twitter API key...
var timeout  = 1000 * 30;//search Interval
var maxTweets = 3;//max tweets to search in timeout inteval
var currentConnections = {};
var userData = {};//used to save access token etc.
module.exports = function(coreObj) {
	if (!debug) {
		process.nextTick(function(){
			logTwitter = log.tag('mail'); 
		});
	}
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
			log("twitter room obj, ", JSON.stringify(room));
			if (room.type == 'room' && room.params && room.params.twitter) {
				addTwitterTokens(room, callback);			
			}
			else {
				callback();
			}
		},"gateway");
	}
	else {
		log("twitter is not enabled");
	}
	
	
};
/**
 *Read twitter token from redis and 
 *add it to room object
 */
function addTwitterTokens(room, callback) {
	logTwitter("adding twitter tokens.", room);
	var multi = redis.multi();
	multi.get("twitter:userData:token:" + room.owner);
	multi.get("twitter:userData:tokenSecret:" + room.owner);
	multi.get("twitter:userData:profile:" + room.owner);
	multi.exec(function(err, replies) {
		if (err) {
			logTwitter("some redis Error");
			callback(err);
		}
		else {
			if (room.accounts) {
				var  isTwitter = false;
				room.accounts.forEach(function (account) { 
					if (account.gateway === 'twitter') {
						isTwitter = true;
						if (replies[0] && replies[1] && replies[2]) {
							logTwitter("adding new values....");
							account.params.token = replies[0];
							account.params.tokenSecret = replies[1];
							account.params.profile = replies[2];
							account.params.tags = account.params.tags || "";
							account.params.tags = account.params.tags.trim();
							callback();
						}
						else {//new values are not present in redis.. copy old
							copyOld();
						}
					}
				});
				if (!isTwitter) {
					callback("twitter login error");
				}
			} else {
				callback("twitter login error");
			}
		}
	});
	function copyOld() {
		logTwitter("copyOld");
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
			if (!isTwitter) {
				callback("Error in twitter login");
			}
		}
		else {
			callback("Error in twitter login");
		}
	}
}


function init() {
	setInterval(initTwitterSeach, timeout);
	//setTimeout(init(), 5000 * 10);
	
	
}

/**
 *Get all accounts where gateway = 'twitter' and init searching.
 */
function initTwitterSeach() {
	db.query("SELECT * FROM `accounts` WHERE `gateway`='twitter'", function(err, data) {
		if(err) throw "Cannot retrieve twitter accounts";
		
		//logTwitter("all data = ", data);
		data.forEach(function(account) {
			logTwitter("connecting for room...", account.room);
			account.params = JSON.parse(account.params);
			fetchTweets(account);
		});
	});
}
/**
 *Connect with twitter
 *1. if tag is empty will not connect
 */
function fetchTweets(account) {
	
	if (account.params && account.params.tags !== "") {
		logTwitter("connecting for account", account);
		var twit;
		twit = new Twit({
			consumer_key: twitterConsumerKey ,
			consumer_secret: twitterConsumerSecret,
			access_token:  account.params.token,
			access_token_secret: account.params.tokenSecret
		});
		logTwitter("calling room,", account.room);
		redis.get("twitter:maxSinceId:" + account.room, function(err, data) {
			twit.get(
				'search/tweets', {
					q: account.params.tags,
					count: maxTweets,
					since_id: data
				}, function(err, reply) {
					if (err) {
						logTwitter("error", err);
					}
					else {
						logTwitter("var reply= ", JSON.stringify(reply));
						redis.set("twitter:maxSinceId:" + account.room, reply.search_metadata.max_id_str, function(err, data) {
							logTwitter("added data to room...", err, data);
							sendMessages(reply, account);
						});
						
					}
				}	
			);
		});
		
	}
	
	
}

/**
 *Send selected messages
 *@param {object} Twitter reply Object
 */
function sendMessages(replies, account) {
	
	
	
	replies.statuses.forEach(function(r) {
		if (!r.retweeted) {
			var message = {
				id: guid(),
				type: "text",
				text: r.text,
				origin: "twitter",
				from: r.user.screen_name,
				to: account.room,
				time: new Date().getTime()
			};
			core.emit("message", message);
		}
		
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
	logTwitter("path " , path , req.url ," session" , req.session.user);
	var ps = path.split('/');
	if (ps[0] && ps[0] === "login") {
		//passport.initialize();
		logTwitter("login request...");
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
				logTwitter("tokens", token, tokenSecret);
				userData[req.session.user.id] = {token: token,tokenSecret: tokenSecret, profile : profile};
				
				var multi = redis.multi();
				multi.setex("twitter:userData:token:" + req.session.user.id, expireTime, token);
				multi.setex("twitter:userData:tokenSecret:" + req.session.user.id, expireTime, tokenSecret);
				multi.setex("twitter:userData:profile:" + req.session.user.id, expireTime, profile);
				multi.exec(function(err,replies) {
					logTwitter("user data added-----", replies);	
				});
				done(null, profile);
			}
		));
		
		passport.authenticate('twitter')(req, res, next);
	}
	else if (ps.length >= 3 && ps[0] === "auth" && ps[1] === "callback") {
		var auth = passport.authenticate('twitter', {failureRedirect: '/r/twitter/login' });
		auth(req, res, function(err) {
			logTwitter("ret ", err , ps[2] + "," , req.session.user.id);
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







