"use strict";
var config;
var log = require("../lib/logger.js");
var send;
var fs=require("fs")/*,jade = require("jade")*/;
var redis;
var core, digestJade;
var timeout = 30 * 1000;//for debuging only
var waitingTime1, waitingTime2;
var handlebars = require("handlebars");
var timeUtils = require("../lib/time-utils");
/**
 * Read digest,jade
 * And setInterval
 */
function init() {
	fs.readFile(__dirname + "/views/digest.hbs", "utf8", function(err, data) {
		if(err) throw err;
		digestJade = handlebars.compile(data.toString());
		//send mails in next hour
		var x = new Date().getUTCMinutes();
		var sub = 90;
		if (x < 30) {
			sub = 30;
		}
		log.d("Init email will send email after ", (sub - x)* 60000, " ms");
		setTimeout(function(){
			sendPeriodicMails();
			setInterval(sendPeriodicMails, 60*60*1000);//TODO move these numbers to myConfig
		}, (sub-x)*60000);
		setTimeout(function(){
			trySendingToUsers();
			setInterval(trySendingToUsers, 60*60*1000);
		}, (60-x)*60000);
	});
}

/**
 *Try sending mail to waiting users.
 *Reads email:toSend from redis.
 */
function trySendingToUsers() {
	redis.smembers("email:toSend", function(err,usernames) {
		if(!err && usernames) {
			if (config.debug) log.d("checking for mentions...", usernames);
			usernames.forEach(function(username) {
				initMailSending(username);
			});
		}
	});
}

/**
 *Init of mail sending to username
 *conditions that can call the function
 *1 - after 24 hours(12 AM in user's timezone)
 *2 - On nick mention
 *3 - Periodic check for mention timeout.
 *@param {string} username username
 */
 function initMailSending(username) {
	log.d("init mail sending for user  " + username);
	redis.get("email:" + username + ":lastsent", function(error, lastSent) {
		log.d("data returned form redis for username "+ username + " " + lastSent  +" , " , error);
		if (error) return;
		redis.get("email:" + username + ":isMentioned", function(err, data) {
			var ct = new Date().getTime();
			var interval = waitingTime2;
			if(err) log.e(err);
			if (data) interval = waitingTime1;
			if (config.debug) {
				log.d("username " + username + " is mentioned ", data);
				interval = timeout/2;
				if (data) interval = timeout/8;
				log.d("interval " , interval);
			}
			if (!lastSent )	lastSent = ct - interval;
			log.d("time left for user " , (parseInt(lastSent, 10) + interval - ct));
			if (parseInt(lastSent, 10) + interval <= ct) {
				//get rooms that user is following...
				log.d("getting rooms that user is following....", username);
				core.emit("getRooms", {hasMember: username, session: "internal-email"}, function(e, following) {
					log.d("results:", following);
					if(err || !following) {
						log.d("error in getting members information" , e);
						return;
					}
					if(!following.results || !following.results.length) {
						log.d("username ", username ," is not following any rooms ");
						return;
					}
					
					
					
					log.d("got the follower rooms preparing email.:", username, following.results);
					var rooms = [];
					following.results.forEach(function(r) {
						if(r.role === 'none') return;
						rooms.push(r.id);
					});
					prepareEmailObject(username, rooms, lastSent, function(errObj, email) {
						log.d(errObj, email);
						if (!errObj) sendMail(email);
					});
				});
				redis.srem("email:toSend", username);
			}else {
				log.d("can not send email to user ", username, " now");
				redis.sadd("email:toSend", username, function(e, res) {
					if (e) log.d(e, res);
				});
			}
		});

	});
}

/**
 *send mail to user read data from redis and create mail object
 *email: {
 *  username: {string}, //username
	heading : {string},
	count: {number} ,//total count of threads
	emailId: {string},
	rooms: [
		id: {string}, //room name
		totalCount: {number},//total count of threads
		threads: [
			{
				thread: {string},
				count: {number},
				interesting: [
					messages objects
				]
			},
			....
		],
		...
	],
 }
 *@param {string} username
 *@param {string} rooms all rooms that user is following
 *@param {function} callback(err, emailObject).
 */
function prepareEmailObject(username ,rooms, lastSent, callback) {
	if (config.debug) log.d("send mail to user ", username , rooms, lastSent);
	var email = {};
	email.username = username;
	email.rooms = [];
	var ct = 0;
	var vq = 0;
	rooms.forEach(function(room) {
		var roomsObj = [];
		var qc = 0;
		var m = "email:mentions:" + room + ":" + username;
		qc++;
		redis.smembers(m, function(error, mentions) {
			if (!error) {
				mentions.sort(function(a, b) {
					a = JSON.parse(a);
					b = JSON.parse(b);
					return a.time - b.time;
				});
				log.d("mentions returned from redis ", room ,mentions, lastSent);
				var l = "email:thread:" + room + ":threads";

				redis.zrangebyscore(l, lastSent, "+inf", "withscores",  function(err, t) {
					var times=[], threads=[], i;
					log.d("threads returned from redis" , threads);
					roomsObj.threads = [];
					for(i=0;i<t.length;i+=2) {
						threads.push(t[i]);
						times.push(t[i+1]);
					}
					i = 0;
					roomsObj.totalCount = threads.length;
					if (!err) {
						var isThread = false;
						threads.forEach(function(thread) {
							var time = times[i];
							i++;
							isThread = true;
							var lc = "email:thread:" + room + ":" + thread + ":count";
							qc++;
							redis.get(lc, function(e,count) {
								if (e) {
									callback(e);
								}else {
									var ll = {
										displayTime: timeUtils.short(time),
										thread: thread ,
										count : parseInt(count, 10)
									};

									if(roomsObj.threads.length < 2) roomsObj.threads.push(ll);

								}
								done(roomsObj, mentions);
							});
						});
						if (!isThread) {
							qc++;//if no thread never call done() for this room;
							isNoThread();
							ct++;
						}
					}
					else {
						callback(err);
					}
					done();//members

				});
			}
			else {
				callback(error);
			}
		});
		function isNoThread() {
			if (++vq >= rooms.length) {
				callback(new Error("NO_DATA"));
			}
		}
		function done(roomObj, mentions) {
			log.d("room done......" , room , qc);
			if(--qc > 0 ) return;

			sortThreads(room ,roomObj,mentions,function(err,rr) {
				if (err) callback(err);
				else {
					email.rooms.push(rr);
					ct++;
					if (ct >= rooms.length) {
						deleteMentions(username, rooms);
						log.d("email object creation complete" , JSON.stringify(email));
						callback(null, email);
					}
				}
			});
		}
	});
}

/**
 *create email.rooms element
 *filter out threads and generate threads array for current room
 *Add thread.interesting messages.
 */
function sortThreads(room, roomObj, mentions,callback) {
	var maxThreads = 5;
	log.d("sort threads");
	var r = {};
	var ct = 0;
	r.id = room;
	r.totalCount = roomObj.totalCount;
	r.threads = [];
	roomObj.threads.forEach(function(thread) {
		thread.interesting = [];
		mentions.forEach(function(m) {
			//TODO use new schema
			m = JSON.parse(m);
			var id = m.thread;
			m.from = m.from.replace(/guest-/g, "");
			log.e(m.from);
			if(id === thread.thread) {
				log.e(m)
				thread.interesting.push(m);
				thread.title = m.title || "";
			}
		});
		ct++;
		redis.get ("email:thread:" + room + ":" + thread.thread + ":title", function(err, title) {
			var pos = r.threads.length;
			for (var i = 0; i < r.threads.length; i++ ) {
				if (r.threads[i].interesting.length < thread.interesting.length ) {
					pos = i;
					break;
				}
				else if(r.threads[i].interesting.length === thread.interesting.length) {
					if (r.threads[i].count < thread.count) {
						pos = i;
						break;
					}
				}
			}
			var rm = -1;
			if (r.threads.length >= maxThreads) {
				rm = r.threads.length;
			}
			r.threads.splice(pos,0,thread);
			r.threads.sort(function(l1,l2){
				return l2.count - l1.count;
			});
			if (rm !== -1) {
				r.threads.splice(rm,1);
			}
			
			if (!err && title) {
				thread.title = title;
				done();
			} else {
				core.emit("getThreads", {to:room, ref: thread.thread, session: "internal-email"}, function(err, result) {
					if(err || !result || !result.results || !result.results.length) {
						thread.title = "Title";
					} else {
						thread.title = result.results[0].title || "Title";
					}					
					done();
				});
			}
		});
	});
	function done() {
		if (--ct > 0) {
			return;
		}
		r.threads.sort(function(l1, l2) {
			return l2.count - l1.count;
		});
		var nn = 0;
		r.threads.forEach(function(thread) {
			nn++;
			redis.lrange("email:thread:" + room + ":" + thread.thread + ":tail", 0, -1, function(err, lastMsgs) {
				if (lastMsgs ) {
					lastMsgs.reverse();
					lastMsgs.forEach(function(lastMsg) {

						var isP = true;
						var msg = JSON.parse(lastMsg);

						msg.from = msg.from.replace(/guest-/g, "");
						log.e(msg)
						thread.interesting.forEach(function(m) {
							if(m.id === msg.id) {
								isP = false;
							}
						});
						if (isP) {
							thread.interesting.push(msg);
						}
					});
				}
				complete();
			});
		});
		log.d("room Obj " , JSON.stringify(r));
		function complete() {
			if (--nn > 0) {
				return;
			}
			r.threads.forEach(function(thread) {
				thread.interesting.sort(function(m1,m2){
					return m1.time - m2.time;
				});
			});
			callback(null, r);
		}
	}
}

/**
 *delete all mentions of user on rooms from redis
 *@param {string} username.
 * @param rooms
 */
function deleteMentions(username , rooms) {
	rooms.forEach(function(room) {
		var m = "email:mentions:" + room + ":" + username;
		var multi = redis.multi();
		multi.del(m);
		m = "email:" + username + ":isMentioned";
		multi.del(m);
		multi.exec(function(replies) {
			log.d("mentions deleted" , replies);
		});
	});
}

/**
 *Read data from email Object render HTML from email object using /views/digest.jade
 *and then send mail to email.emailId
 *@param {object} Email Object
 */
function sendMail(email) {
	core.emit("getUsers", {ref: email.username, session: "internal-email"}, function(err, data) {
		if (err || !data.results) return;
		var user = data.results;
		log.d("getting email id", data);
		var mailAccount;
		if (user && user[0] && user[0].identities) {
			mailAccount = user[0].identities;

			mailAccount.forEach(function(e) {
				if (e.indexOf("mailto:") === 0) {
					email.emailId = e.substring(7);
					var html;
					try {
						email.heading = getHeading(email);
						log.d("email object" + JSON.stringify(email));
						html = digestJade(email);
					}catch(caughtError) {
						log.e("Error while rendering email: ", caughtError);
						return;
					}
					log.d(email , "sending email to user " , html );
					send(config.from, email.emailId, email.heading, html);
					redis.set("email:" + email.username + ":lastsent", new Date().getTime());
					var interval = 2*24*60*60*1000;//TODO move this variable inside myConfig
					if (config.debug) {
						interval = timeout*2;
					}
					email.rooms.forEach(function(room) {
						redis.zremrangebyscore("email:thread:" + room.id + ":threads", 0,
							new Date().getTime() - interval , function(error, res) {
								log.d("deleted old threads from that room " , error ,res);
							});//ZREMRANGEBYSCORE email:scrollback:threads -1 1389265655284
					});
				}
			});
		}
	});
}
/**
 *Generate Heading from email Object
 *@param {object} email Object
 */
function getHeading(email) {
	var heading = "";
	var bestThread;
	var bestMention = {};
	var threadCount = 0;
	var more = 0;
	email.rooms.forEach(function(room) {
		threadCount += room.totalCount;
		more += room.threads.length;
		room.threads.forEach(function(thread) {
			if (!bestThread) {
				bestThread = {};
				bestThread.title = formatText(thread.title);
				bestThread.room = room.id;
				bestThread.count = thread.count;
			}
			else if(bestThread.count < thread.count){
				bestThread.title = formatText(thread.title);
				bestThread.room = room.id;
				bestThread.count = thread.count;
			}
			log.d("best thread", bestThread);
			thread.interesting.forEach(function(m) {
				if (!bestMention.mentions && m.mentions && m.mentions.indexOf(email.username) !== -1) {
					bestMention = m;
				}
				else if(m.mentions && m.mentions.indexOf(email.username) !== -1 && bestMention.text.length < m.text.length) {
					bestMention = m;
				}
			});
		});
	});
	email.count = threadCount;
	if (bestMention.mentions) {//if mentioned
		heading += "[" + bestMention.from.replace(/guest-/g, "") +  "] " + bestMention.text + " - on " + bestMention.to;
	}
	else {
		var tail = (more > 1 ? " +" + (more - 1) + " more": "");
		heading += "[" + bestThread.room.substring(0,1).toUpperCase() + bestThread.room.substring(1) + "] " +
			bestThread.title + tail;
	}
	email.formatText = formatText;
	return heading;
}
var formatText = function(text) {
	var s  = text.replace(/-/g,' ');
	s = s.trim();
	s = s.substring(0,1).toUpperCase() + s.substring(1);
	return s;
};
/**
 *Send mails to users based on current time.
 *@param {object} Map of room data.
 */
function sendPeriodicMails(){
	var x = new Date().getUTCHours();
	var t;
	var start1 = x >= 12 ? (24 - x)*60 : -x*60;
	var end1 = start1 + 59;
	var start2 = -100*60;//big values
	var end2 = -200*60;
	if (config.debug) {
		start1=0;//for testing....
		end1=10000000;//for testing...
	}

	if (x >= 9 && x < 12) {
		start2 = 24*60 + start1;//(+12 +14 +13)
		end2 = start2 + 59;//+13
	}
	if (x === 12) {
		start2 = -12*60;
		end2 = start2 + 59;
	}
	log.d("current time hour:",x+","+start1+","+start2);
	function processResults(err, data) {
		log.d("err", err, " data: ", data );
		if (err || !data.results) return;
		var users = data.results;
		users.forEach(function(user) {
			log.d("trying for user", user);
			if (user.params && (!user.params.email || user.params.email.frequency !== "never")) {//TODO write a query based on freq
				initMailSending(user.id);
			}
		});
	}
	if (start1 > end1) {
		t = start1;
		start1 = end1;
		end1 = t;
	}
	if (start2 > end2) {
		t = start2;
		start2 = end2;
		end2 = t;
	}
	core.emit("getUsers", {timezone: {gte: start1, lte: end1}, session: "internal-email"}, function(err, data) {
		processResults(err, data);
	});
	core.emit("getUsers", {timezone: {gte: start2, lte: end2}, session: "internal-email"}, function(err, data) {
		processResults(err, data);
	});

}

module.exports.init = function (coreObj, conf) {
	config = conf;
	core = coreObj;
	send = require('./sendEmail.js')(config);
	waitingTime1 = config.mentionEmailTimeout || 3 * 60 * 60 * 1000; //mention email timeout
	waitingTime2 = config.regularEmailTimeout || 12 * 60 * 60 *  1000;//regular email timeout
 	redis = require('redis').createClient();
	redis.select(config.redisDB);
	init();
};
module.exports.initMailSending = initMailSending;
module.exports.trySendingToUsers = trySendingToUsers;
module.exports.sendPeriodicMails = sendPeriodicMails;
