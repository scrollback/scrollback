var log = require("../lib/logger.js");
var logTwitter = log;
var htmlEncode = require('htmlencode');
var Twit = require('twit');
var guid = require("../lib/generate.js").uid;
var config = require('../config.js');
var OAuth = require('oauth');
var internalSession = Object.keys(config.whitelists)[0];
var host = config.http.host;
var redis = require('../lib/redisProxy.js').select(config.redisDB.twitter);
var twitterConsumerKey = config.twitter.consumerKey;
var twitterConsumerSecret = config.twitter.consumerSecret;
var debug = config.twitter.debug;
var core;
var expireTime = 15 * 60;//expireTime for twitter API key...
var timeout  = 1000 * 60 ;//search Interval
var maxTweets = 1;//max tweets to search in timeout inteval
var pendingOauths = {};
var oauthTimeout = 15 * 60 * 60;//15 min
module.exports = function(coreObj) {

	if (config.twitter && config.twitter.consumerKey && config.twitter.consumerSecret) {
		log("twitter app started");
		if (!debug) {
			logTwitter = log.tag('twitter');
		}
		core = coreObj;
		init();

		core.on("http/init", function(payload, callback) {
			payload.twitter = {
				get: function(req,res,next) {
					getRequest(req,res,next);
				}
			};
			callback(null, payload);
		}, "setters");

		core.on("room", twitterRoomHandler, "gateway");
		core.on("room", twitterParamsValidation, "appLevelValidation");
	}
	else {
		log("Twitter module is not enabled.");
	}
};


function twitterParamsValidation(action, callback) {
	for (var i = 0;i < action.room.identities.length;) { //remove all twitter identities
		if(/^twitter/.test(action.room.identities[i])) {
			action.room.identities.splice(i, 1);
		} else i++;
	}
    callback();
}


function twitterRoomHandler(action, callback) {
	var room = action.room;
	log("room twitter--", JSON.stringify(room));
	if (room.params.twitter && room.params.twitter.username) {
		addTwitterTokens(action, callback);
	} else {
		callback();
	}
}
/**
 *Read twitter token from redis and
 *add it to room object
 */
function addTwitterTokens(room, callback) {
	logTwitter("adding twitter tokens.", JSON.stringify(room));
	redis.multi(function(multi) {
		var key = room.room.params.twitter.username;
		multi.get("twitter:userData:token:" + key);
		multi.get("twitter:userData:tokenSecret:" + key);
		multi.get("twitter:userData:profile:" + key);
		multi.exec(function(err, replies) {
			log("replies from redis", replies);
			if (err) {
				logTwitter(" Error: ", err);
                room.params.twitter.error = "ERR_TWITTER_LOGIN";
				callback();
			}
			else {
				if (replies[0] && replies[1] && replies[2]) {
					logTwitter("twitter ---adding new values....");
					room.room.params.twitter.token = replies[0];
					room.room.params.twitter.tokenSecret = replies[1];
					room.room.params.twitter.profile = JSON.parse(replies[2]);
					room.room.params.twitter.tags = room.room.params.twitter.tags || "";
					room.room.params.twitter.tags = formatString(room.room.params.twitter.tags);
					log("added values from redis");
					addIdentity(room, key);
					callback();
					redis.multi(function(multi) {
						multi.del("twitter:userData:token:" + key);
						multi.del("twitter:userData:tokenSecret:" + key);
						multi.del("twitter:userData:profile:" + key);
						multi.exec(function(err, r) {
							log("values deleted from redis", r);
						});
					});

				} else {//new values are not present in redis.. copy old
					copyOld(room, callback);
				}

			}
		});
	});
}
function addIdentity(room, username) {
	room.room.identities.push("twitter://" + room.room.id + ":" + username);
}


function copyOld(room, callback) {
	logTwitter("copyOld");

	var old, newParams;//old account
	if(room.old && room.old.params) old = room.old.params.twitter;
    newParams = room.room.params.twitter;
	if(old) {
		newParams.token = old.token;
		newParams.tokenSecret = old.tokenSecret;
		newParams.profile = old.profile;
		if(!newParams.tags) newParams.tags = "";
		newParams.tags = formatString(newParams.tags);
		addIdentity(room, old.profile.screen_name);
		callback();
	}
	else {
        newParams.error = "ERR_TWITTER_LOGIN";
		callback();
	}
}


function formatString(s) {
	if (s & s.length > 256) {
		s = s.substring(0,256);
	}
	return s.trim().replace(/\s{2,}/g, ' ');
}

function init() {
	setInterval(deletePendingOAuths, oauthTimeout);//expire Oauth Object
	setInterval(initTwitterSearch, timeout);
}

/**
 *Get all accounts where gateway = 'twitter' and init searching.
 */
function initTwitterSearch() {
	log("getting room data....");
	core.emit("getRooms",{identity: "twitter", session: internalSession }, function(err, data) {
		if (!err) {
			if(debug) logTwitter("data returned from labelDB: ", JSON.stringify(data));
			var rooms = data.results;
			rooms.forEach(function(room) {
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
						//logTwitter("var reply= ", JSON.stringify(reply));
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
		var text;
		if (r.retweeted_status && r.retweeted_status.text) {
			text = "RT " + r.retweeted_status.text;
		}else text = r.text;
		if (!r.retweeted) {
			core.emit('init', {
				suggestedNick: r.user.screen_name,
				session:  "twitter://" + r.user.screen_name,
				to: "me",
				type: "init",
				origin: {
					gateway: "twitter"
				}
			}, function(err, init) {
				if (err) return;
				var message = {
					id: guid(),
					type: "text",
					text: htmlEncode.htmlDecode(text),
					from: init.user.id,
					to: room.id,
					time: new Date().getTime(),
					session: "twitter://" + r.user.screen_name
				};
				core.emit("text", message, function(err) {
					if(err) log("error while sending message:" , err);
				});
			});
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
	var ps = path.split('/');
	if (ps[0] && ps[0] === "login") {
		var uid = guid();
		var oauth = new OAuth.OAuth (
			'https://api.twitter.com/oauth/request_token',
			'https://api.twitter.com/oauth/access_token',
			twitterConsumerKey,
			twitterConsumerSecret,
			'1.0A',
			host + "/r/twitter/oauth/callback/" + uid,
			'HMAC-SHA1'
		);
		pendingOauths[uid] = {oauth: oauth, time: new Date().getTime()};
		oauth.getOAuthRequestToken({"scope": "https://api.twitter.com/oauth/request_token"},
								function(error, oauth_token, oauth_token_secret/*, results*/) {
			res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + oauth_token);
			pendingOauths[uid].oauthToken = oauth_token;
			pendingOauths[uid].oauthTokenSecret = oauth_token_secret;

			log("callback url", arguments);
		});
		log("twitter oauth=", oauth);
	}
	else if (ps.length >= 3 && ps[0] === "oauth" && ps[1] === "callback") {
		log("oauth", pendingOauths[ps[2]]);
		var obj = pendingOauths[ps[2]];
		if (obj) {
			obj.oauth.getOAuthAccessToken(obj.oauthToken, obj.oauthTokenSecret, req.query.oauth_verifier,
										function(error, access_token, access_token_secret, results) {
				if (error) return console.log('error: ' + JSON.stringify(error));
				else {
					console.log('oauth_access_token: ' + access_token);
					console.log('oauth_access_token_secret: ' + access_token_secret);
					//save tokens.
					console.log("results: ", results);
					var uid = results.screen_name;
					redis.multi(function(multi) {
						multi.setex("twitter:userData:token:" + uid, expireTime, access_token);
						multi.setex("twitter:userData:tokenSecret:" + uid, expireTime, access_token_secret);
						multi.setex("twitter:userData:profile:" + uid, expireTime, JSON.stringify(results));
						multi.exec(function(err,replies) {
							logTwitter("user data added: ", replies);
						});
					});
					return res.render(__dirname + "/login.jade", {profile: { screen_name: results.screen_name }});
				}
			});
			delete pendingOauths[ps[2]];
		}

	} else {
		next();
	}

}

function deletePendingOAuths() {
	for (var id in pendingOauths) {
		if (pendingOauths.hasOwnProperty(id)) {
			var t = new Date().getTime(),
			     pt = pendingOauths[id].time;
			if (t - pt >= oauthTimeout) {
				log("deleting Pending oauth");
				delete pendingOauths[id];
			}
		}
	}
}
/**** get request handler *******/
