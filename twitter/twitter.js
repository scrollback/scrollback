var log = require("../lib/logger.js");
var passport = require('passport');
var fs = require("fs");
var TwitterStrategy = require('passport-twitter').Strategy;
var twitterConsumerKey = "7MWjUNkM6OL7hYctSTOA";
var twitterConsumerSecret = "7CEXmq4wbchWww3g4gEzdnLT9xuTnwxdD5jSOXjVgQ";
var callbackURL =  "https://kamal.scrollback.io/r/twitter/auth/callback";
var core;
var config = require('../config.js');
var redis = require("redis").createClient();
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
		if (room.type == 'room') {
			if (room.params && room.params.twitter) {
				
			}
		}
		log("twitter", room);
		callback();
	},"gateway");
	
};
function init() {
	
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
				if(true) $('#twitterLogin').text(event.data);
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
		//passport.initialize()(req, res, next);
		//passport.session()(req, res, next);
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
				//save this in redis....
				userData[req.session.user.id] = {token: token,tokenSecret: tokenSecret, profile : profile};
				log("user data added");
				var user = profile;
				return done(null, user);
			}
		));
		
		passport.authenticate('twitter')(req, res, next);
	}
	else if (ps.length >= 3 && ps[0] === "auth" && ps[1] === "callback") {
		var auth = passport.authenticate('twitter', {failureRedirect: '/r/twitter/login' });
		log("var =" , userData);
		auth(req, res, function(err) {
			log("ret ", err , ps[2], userData);
			
			res.render(__dirname + "/login.jade", userData[ps[2]]);
			//res.end("success" + JSON.stringify(userData[ps[2]]));
		});
		//passport.authenticate('twitter');
		//res.end("logged in");
	}
	else {
		next();
	}
	
	//res.redirect('https://twitter.com/oauth');	
}

/**** get request handler *******/







