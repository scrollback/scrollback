var log = require("../lib/logger.js");
var logTwitter = log;
var passport = require('passport');
var fs = require("fs");
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
var expireTime = 15 * 60;//expireTime for twitter API key...
var timeout  = 1000 * 60 ;//search Interval
var maxTweets = 1;//max tweets to search in timeout inteval
var currentConnections = {};
var userData = {};//used to save access token etc.
module.exports = function(coreObj) {
	
	if (config.twitter && config.twitter.consumerKey && config.twitter.consumerSecret) {
		log("twitter app started");
		if (!debug) {
			process.nextTick(function(){
				logTwitter = log.tag('twitter'); 
			});
		}
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
			log("room twitter--", JSON.stringify(room));
			if (room.type == 'room' && room.params && room.params.twitter) {
				addTwitterTokens(room, callback);			
			}
			else {
				callback();
			}
		},"gateway");
	}
	else {
		log("Twitter module is not enabled.");
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
			logTwitter("some redis Error: ", err);
			callback(new Error("TWITTER_LOGIN_ERROR"));
		}
		else {
			if (replies[0] && replies[1] && replies[2]) {
				logTwitter("adding new values....");
				room.params.twitter.token = replies[0];
				room.params.twitter.tokenSecret = replies[1];
				room.params.twitter.profile = JSON.parse(replies[2]);
				room.params.twitter.tags = room.params.twitter.tags || "";
				room.params.twitter.tags = formatString(room.params.twitter.tags);
				callback();
			}
			else {//new values are not present in redis.. copy old
				copyOld();
			}
		
		}
	});
	function copyOld() {
		logTwitter("copyOld");
		
		var old;//old account
		if(room.old && room.old.params) old = room.old.params.twitter;
		if(old && old.token && old.tokenSecret && old.profile) {
			room.params.twitter.token = old.token;
			room.params.twitter.tokenSecret = old.tokenSecret;
			room.params.twitter.profile = old.profile;
			if(!room.params.twitter.tags) room.params.twitter.tags = "";
			room.params.twitter.tags = formatString(room.params.twitter.tags);
			callback();
		}
		else {
			callback(new Error("TWITTER_LOGIN_ERROR"));
		}
		
	}
}


function formatString(s) {
	if (s & s.length > 256) {
		s = s.substring(0,256);
	}
	return s.trim().replace(/\s{2,}/g, ' ');
}

function init() {
	setInterval(initTwitterSeach, timeout);
}

/**
 *Get all accounts where gateway = 'twitter' and init searching.
 */
function initTwitterSeach() {
	log("getting room data....");
	core.emit("getRooms",{identities:"twitter"}, function(err, data) {
		if (!err) {
			if(debug) logTwitter("data returned from labelDB: ", JSON.stringify(data));
			data.forEach(function(room) {
				fetchTweets(room);
			});
		}
	});
}
/**
 *Connect with twitter
 *1. if tag is empty will not connect
 */
function fetchTweets(room) {

	if (room.params && room.params.twitter  && room.params.twitter.tags && room.params.twitter.token && room.params.twitter.tokenSecret) {
		logTwitter("connecting for room: ", room);
		var twit;
		twit = new Twit({
			consumer_key: twitterConsumerKey ,
			consumer_secret: twitterConsumerSecret,
			access_token:  room.params.twitter.token,
			access_token_secret: room.params.twitter.tokenSecret
		});
		logTwitter("calling room,", room);
		redis.get("twitter:lastTweetId:" + room.id, function(err, data) {
			
			twit.get(
				'search/tweets', {
					q: room.params.twitter.tags.split(" ").join(" OR "),
					count: maxTweets,
					result_type: "recent"
				}, function(err, reply) {
					if (err) {
						logTwitter("Error: ", err);
					}
					else {
						logTwitter("var reply= ", JSON.stringify(reply));
						if (reply.statuses && reply.statuses[0] && !reply.statuses[0].retweeted && (reply.statuses[0].id + "") !== data) {
							redis.set("twitter:lastTweetId:" + room.id, reply.statuses[0].id, function(err, data) {
								logTwitter("added data to room...", err, data);
								sendMessages(reply, room);
							});
						}
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
function sendMessages(replies, room) {
	replies.statuses.forEach(function(r) {
		if (!r.retweeted) {
			var message = {
				id: guid(),
				type: "text",
				text: r.text,
				from: "guest-" + r.user.screen_name,
				to: room.id,
				time: new Date().getTime(),
				session: "twitter:" + r.user.screen_name
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
				multi.setex("twitter:userData:profile:" + req.session.user.id, expireTime, JSON.stringify(profile));
				multi.exec(function(err,replies) {
					logTwitter("user data added: ", replies);	
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







