var log = require("../lib/logger.js");
var passport = require('passport');
var fs = require("fs");
var db = require("../lib/mysql.js");
var Twit = require('twit');
var guid = require("../lib/guid.js");
var config = require('../config.js');
var redis = require("redis").createClient();
var TwitterStrategy = require('passport-twitter').Strategy;
var twitterConsumerKey = "7MWjUNkM6OL7hYctSTOA";
var twitterConsumerSecret = "7CEXmq4wbchWww3g4gEzdnLT9xuTnwxdD5jSOXjVgQ";
var callbackURL =  "https://kamal.scrollback.io/r/twitter/auth/callback";
var core;
var expireTime = 10*60;
var timeout  = 100000;//reconnect time for twitter...
var currentConnections = {};
var userData = {};
module.exports = function(coreObj) {
	log("twitter app started");
	core = coreObj;
	init();
	fs.readFile(__dirname + "/twitter.html", "utf8", function(err, data){
		if(err)	throw err;
		core.on("http/init", function(payload, callback) {
            payload.twitter = {
				config: data,
				script: getScripts(),
				get: function(req,res,next) {	
					getReq(req,res,next);
				}
			};
			callback(null, payload);
        }, "setters");
	});
	core.on("room", function(room, callback){
		log("twitter room obj", JSON.stringify(room));
		if (room.type == 'room') {
			if (room.params && room.params.twitter) {
				addTwitterTokens(room, callback);			
			}
			else {
				disconnect(room);
				callback();
			}
		}
		else {
			callback();
		}
		log("twitter", room);
		//callback();
	},"gateway");
	
};

function addTwitterTokens(room, callback) {
	var isNew = true;
	var acc;
	room.old.accounts.forEach(function(account) {
		if (account.gateway === "twitter") {
			if (account.params.token && account.params.tokenSecret && account.params.profile) {
				acc = account;	
				isNew = false;
			}
		}
	});
	if (isNew) {//if tokens are not present in room obj
		var multi = redis.multi();
		multi.get("twitter:userData:token:" + room.owner);
		multi.get("twitter:userData:tokenSecret:" + room.owner);
		multi.get("twitter:userData:profile:" + room.owner);
		multi.exec(function(err, replies) {
			if (err) {
				callback(err);
			}
			else {
				if (room.accounts) {
					var  isTwitter = false;
					room.accounts.forEach(function (account) { 
						if (account.gateway === 'twitter') {
							if (replies[0] && replies[1] && replies[2]) {
								isTwitter = true;	
								account.params.token = replies[0];
								account.params.tokenSecret = replies[1];
								account.params.profile = replies[2];
								account.params.tags = account.params.tags.trim();
								disconnect(room);
								connect(account);
								callback();
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
	}
	else if(acc) {//just reconnect with new values..
		//old account token should be copied
		var ta;
		room.accounts.forEach(function (account) { 
			if (account.gateway === 'twitter') {
				account.params.token = acc.params.token;
				account.params.tokenSecret = acc.params.tokenSecret;
				account.params.profile = acc.params.profile;
				account.params.tags = account.params.tags.trim();
				ta = account;
			}
		});
		log("old twitter account..");
		if (ta.params.tags === '') {//tags is a empty String just disconnect
			log("tags is a empty string disconnecting for room", room.id);
			disconnect(room);
		}
		else {
			disconnect(room);
			connect(ta);
		}
		callback();
	}
	
}



function init() {
	db.query("SELECT * FROM `accounts` WHERE `gateway`='twitter'", function(err, data) {
		if(err) throw "Cannot retrieve twitter accounts";
		
		log("all data = ", data);
		data.forEach(function(account) {
			log("connecting for room...", account.room);
			account.params = JSON.parse(account.params);
			connect(account);
		});
	});
	
	
	
}
/**
 *Given a room obj disconnect that room with twitter completly.
*/
function disconnect(room) {
	if (currentConnections[room.id]) {
		log("removing connection with twitter for ", room.id);
		currentConnections[room.id].stream.stop();
		delete currentConnections[room.id];
	}
}
/**
 *Connect with twitter
 *1. if tag is empty will not connect
 */
function connect(account) {
	log("connecting for account", account);
	if (account.params && account.params.tags !== "") {
		currentConnections[account.room] = {};
		currentConnections[account.room].twit = new Twit({
			consumer_key: twitterConsumerKey ,
			consumer_secret: twitterConsumerSecret,
			access_token:  account.params.token,
			access_token_secret: account.params.tokenSecret
		});
		var stream = currentConnections[account.room].twit.stream('statuses/filter',
					{track: [account.params.tags.split(" ")] });
		log("connecting to twitter for room ", account.room);
		currentConnections[account.room].stream = stream;
		stream.on('tweet', function (tweet) {
			log("room", account.room);
			//log("tweet value", tweet);
			var message = {
				id: guid(),
				type: "text",
				text: tweet.text,
				origin: "twitter",
				from: tweet.user.screen_name,
				to: account.room,
				time: new Date().getTime()
			};
			core.emit("message", message);
		});
		stream.on('disconnect', function (disconnectMessage) {
			log("room ", account.room, " is disconnected");
			//check if disconnected by owner..
			setTimeout(function() {
				connect(account);		
			},timeout);
		});
	}
	
	
}

function getScripts() {
return {
		login: function() {
			window.open("/r/twitter/login", 'mywin','left=20,top=20,width=500,height=500,toolbar=1,resizable=0');
			scrollbackScripts.twitter.loginEvent();
			scrollbackScripts.twitter.loginEvent = function(){};
			return false;
		},
		loginEvent : function() {
			console.log("added listen event");
			window.addEventListener("message", function(event) {
				//console.log("received data---- ", event);
				//TODO check for origin
				if(true) {
					$('#twitterLogin').text(event.data);
					$scope.editRoom.twitterUsername = event.data;
				}
			}, false);
		}
		
	};
}
/**** get request handler *******/
/**
 *  "/r/twitter/login" for login
 *   "/r/twitter/"
 *   "r/twitter/auth/twitter/callback/{username}" callback
 */
function getReq(req, res, next) {
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
	
	//res.redirect('https://twitter.com/oauth');	
}

/**** get request handler *******/







