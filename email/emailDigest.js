var config = require('../config.js');
var log = require("../lib/logger.js");
var db = require('../lib/mysql.js');
var send = require('./sendEmail.js');
var fs=require("fs"),jade = require("jade");
var redis = require("redis").createClient();//require('../lib/redisProxy.js');
var core;
var emailConfig = config.email, digestJade;
var waitingTime1 = config.mentionEmailTimeout; //mention email timeout
var waitingTime2 = config.regularEmailTimeout;//regular email timeout
var timeout = 15*1000;//for debuging only
var debug = emailConfig.debug;
if(!debug) log = log.tag("mail");

module.exports.init = function (coreObj) {
    core = coreObj;
    init();
};
module.exports.intiMailSending = initMailSending;
/**
 *Init of mail sending to username
 *conditions that can call the function
 *1 - after 24 hours(12 AM in user's timezone)
 *2 - On nick mention
 *3 - Periodic check for mention timeout.
 *@param {string} username username
 *@param {array of string}(optional) rooms rooms followed by username.
 */
 function initMailSending(username, rooms) {
    log("init mail sending for user  " + username, " rooms ", rooms);
    log("gettting last email sent to user" , username);
    redis.get("email:" + username + ":lastsent",function(err, lastSent) {
        log("data returned form redis", lastSent);
        if (err) {
            return;
        }
        redis.get("email:" + username + ":isMentioned", function(err, data) {
            var ct = new Date().getTime();
            var interval = waitingTime2 ;
            if (data) {
                interval = waitingTime1;
            }
            if (emailConfig.debug) {
                log("username " + username + " is mentioned ", data);
                interval = timeout/2;
                if (data) {
                    interval = timeout/8;
                }
                log("interval " , interval);
            }
            if (!lastSent ) {//last email sent not set
                lastSent = ct - interval;
            }
            log("time left for user " , (parseInt(lastSent, 10) + interval - ct));
            if (parseInt(lastSent) + interval <= ct) {
                //get rooms that user is following...
                if (!rooms) {
                    log("getting rooms that user is following....");
                    core.emit("members",{user: username},function(err,following) {//TODO get only rooms from DB
                        if (err) {
                            log("error in getting members informtion");
                            return;
                        }
                        log("username ", username ," is following rooms ", following);
                        rooms = [];
                        following.forEach(function(r) {
                            rooms.push(r.room);
                        });
                        prepareEmailObj(username, rooms, lastSent, function(err, email) {

                            if (!err) {
                                sendMail(email);
                            }
                        });
                    });
                }
                else {
                    prepareEmailObj(username, rooms, lastSent, function(err, email) {
                        if (emailConfig.debug) {
                            log(err + " callback of pre email" , email);
                        }
                        if (!err) {
                            sendMail(email);
                        }

                    });
                }
                redis.srem("email:toSend", username);
            }
            else {
                log("can not send email to user ", username, " now" );
                redis.sadd("email:toSend", username);
                return;
            }
        });

    });
}

/**
 * Read digest,jade
 * And setInterval
 */
function init() {
    fs.readFile(__dirname + "/views/digest.jade", "utf8", function(err, data) {
        if(err) throw err;
        digestJade = jade.compile(data,  {basedir: __dirname + "/views/" });
        //send mails in next hour
        var x = new Date().getMinutes();
        var sub = 90;
        if (x < 30) {
            sub = 30;
        }
        setTimeout(function(){
            sendperiodicMails();
            setInterval(sendperiodicMails, 60*60*1000);
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
            if (emailConfig.debug) {
                log("checking for mentions...", usernames);
            }
            usernames.forEach(function(username) {
                initMailSending(username);
            });
        }
    });
}
/**
 *send mail to user read data from redis and create mail object
 *email: {
 *  username: {string}, //username
	heading : {string},
	count: {number} ,//total count of labels
	emailId: {string},
	rooms: [
		id: {string}, //room name
		totalCount: {number},//total count of labels
		labels: [
			{
				label: {string},
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
 *@param {function(err, email) } callback with err, email Object.
 */
function prepareEmailObj(username ,rooms, lastSent, callback) {
    if (emailConfig.debug) log("send mail to user ", username , rooms);
    var email = {};
    email.username = username;
    email.rooms = [];
    var ct = 0;
    var vq = 0;
    rooms.forEach(function(room) {
        var roomsObj = [];
        var qc = 0;
        var m = "email:mentions:" + room + ":" + username ;
        qc++;
        redis.smembers(m, function(err, mentions) {
            if (!err) {
                mentions.sort(function(a, b) {
                    a = JSON.parse(a);
                    b = JSON.parse(b);
                    return a.time - b.time;
                });
                log("mentions returned from redis ", room ,mentions);
                var l = "email:label:" + room + ":labels";

                redis.zrangebyscore(l, lastSent, "+inf",  function(err,labels) {
                    if(emailConfig.debug) log("labels returned from redis" , labels);
                    roomsObj.labels = [];
                    roomsObj.totalCount = labels.length;
                    if (!err) {
                        var isLabel = false;
                        labels.forEach(function(label) {
                            isLabel = true;
                            var lc = "email:label:" + room + ":" + label + ":count";
                            qc++;
                            redis.get(lc, function(err,count) {
                                if (err) {
                                    callback(err);
                                }
                                else {
                                    var ll = {
                                        label: label ,
                                        count : parseInt(count, 10)
                                    };
                                    roomsObj.labels.push(ll);
                                }
                                done(roomsObj, mentions);
                            });
                        });
                        if (!isLabel) {
                            qc++;//if no label never call done() for this room;
                            isNoLabel();
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
                callback(err);
            }
        });
        function isNoLabel() {
            if (++vq >= rooms.length) {
                callback("NO_DATA");
            }
        }
        function done( roomObj, mentions) {
            log("room done......" , room , qc);
            if(--qc > 0 ) return;

            sortLabels(room ,roomObj,mentions,function(err,rr) {
                if (err) {
                    callback(err);
                }
                else {
                    email.rooms.push(rr);
                    ct++;
                    if (ct >= rooms.length) {
                        deleteMentions(username, rooms);
                        log("email object creation complete" , JSON.stringify(email));
                        callback(null, email);
                    }
                }
            });
        }
    });
}
/**
 *delete all mentions of user on rooms from redis
 *@param {string} username.
 * @param rooms
 */
function deleteMentions(username , rooms) {
    rooms.forEach(function(room) {
        var m = "email:mentions:" + room + ":" + username ;
        var multi = redis.multi();
        multi.del(m);
        m = "email:" + username + ":isMentioned";
        multi.del(m);
        multi.exec(function(replies) {
            log("mentions deleted" , replies);
        });
    });
}
/**
 *create email.rooms element
 *filter out labels and generate labels array for current room
 *Add label.interesting messages.
 */
function sortLabels(room, roomObj, mentions,callback) {
    var maxLabels = 5;
    log("sort labels");
    var r = {};
    var ct = 0;
    r.id = room;
    r.totalCount = roomObj.totalCount;
    r.labels = [];
    roomObj.labels.forEach(function(label) {
        label.interesting = [];
        mentions.forEach(function(m) {
            m = JSON.parse(m);
            if(m.labels[0].split(":")[0] === label.label) {
                label.interesting.push(m);
                var index = m.labels[0].indexOf(":") + 1;
                label.title = m.labels[0].substring(index);
            }
        });
        ct++;
        redis.get ("email:label:" + room + ":" + label.label + ":title",function(err, title) {
            if (!err && title) {
                label.title = title;
            }
            var pos = r.labels.length;
            for (var i = 0;i < r.labels.length;i++ ) {
                if (r.labels[i].interesting.length < label.interesting.length ) {
                    pos = i;
                    break;
                }
                else if(r.labels[i].interesting.length === label.interesting.length) {
                    if (r.labels[i].count < label.count) {
                        pos = i;
                        break;
                    }
                }
            }
            var rm = -1;
            if (r.labels.length >= maxLabels) {
                rm = r.labels.length;
            }
            r.labels.splice(pos,0,label);
            r.labels.sort(function(l1,l2){
                return l2.count - l1.count;
            });
            if (rm != -1) {
                r.labels.splice(rm,1);
            }
            done();
        });
    });
    function done() {
        if (--ct > 0) {
            return;
        }
        r.labels.sort(function(l1, l2) {
            return l2.count - l1.count;
        });
        var nn = 0;
        r.labels.forEach(function(label) {
            nn++;
            redis.lrange("email:label:" + room + ":" + label.label + ":tail", 0, -1, function(err, lastMsgs) {
                if (lastMsgs ) {
                    lastMsgs.reverse();
                    lastMsgs.forEach(function(lastMsg) {
                        var isP = true;
                        var msg = JSON.parse(lastMsg);
                        label.interesting.forEach(function(m) {
                            if(m.id === msg.id) {
                                isP = false;
                            }
                        });
                        if (isP) {
                            label.interesting.push(msg);
                        }
                    });
                }
                complete();
            });
        });
        log("room Obj " , JSON.stringify(r));
        function complete() {
            if (--nn > 0) {
                return;
            }
            r.labels.forEach(function(label) {
                label.interesting.sort(function(m1,m2){
                    return m1.time - m2.time;
                });
            });
            callback(null, r);
        }
    }
}
/**
 *Read data from email Object render HTML from email object using /views/digest.jade
 *and then send mail to email.emailId
 *@param {object} Email Object
 */
function sendMail(email) {
    core.emit("rooms", {id: email.username, fields:["accounts"]}, function(err,rooms) {
        log("accounts " ,rooms);
        if (rooms && rooms[0].accounts) {
            rooms[0].accounts.forEach(function(e) {
                log("accounts " ,rooms[0].accounts  , e);
                if (e.id.indexOf("mailto:") === 0) {
                    email.emailId = e.id.substring(7);
                    var html;
                    try {
                        email.heading = getHeading(email);
                        log("email object" + JSON.stringify(email));
                        html = digestJade(email);
                    }catch(err) {
                        log("Error while rendering email: ", err);
                        return;
                    }
                    log(email , "sending email to user " , html );
                    send(emailConfig.from, email.emailId, email.heading, html);
                    redis.set("email:" + email.username + ":lastsent", new Date().getTime());
                    var interval = 2*24*60*60*1000;
                    if (emailConfig.debug) {
                        interval = timeout*2;
                    }
                    email.rooms.forEach(function(room) {
                        redis.zremrangebyscore("email:label:" + room.id + ":labels", 0,
                            new Date().getTime() - interval , function(err, data) {
                                log("deleted old labels from that room " , err ,data);
                            });//ZREMRANGEBYSCORE email:scrollback:labels -1 1389265655284
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
    var bestLabel ;
    var bestMention = {};
    var labelCount = 0;
    var more = 0;
    email.rooms.forEach(function(room) {
        labelCount += room.totalCount;
        more += room.labels.length;
        room.labels.forEach(function(label) {
            if (!bestLabel) {
                bestLabel = {};
                bestLabel.title = formatText(label.title);
                bestLabel.room = room.id;
                bestLabel.count = label.count;
            }
            else if(bestLabel.count < label.count){
                bestLabel.title = formatText(label.title);
                bestLabel.room = room.id;
                bestLabel.count = label.count;
            }
            log("best label", bestLabel);
            label.interesting.forEach(function(m) {
                if (!bestMention.mentions && m.mentions && m.mentions.indexOf(email.username) != -1) {
                    bestMention = m;
                }
                else if(m.mentions && m.mentions.indexOf(email.username) != -1 && bestMention.text.length < m.text.length) {
                    bestMention = m;
                }
            });
        });
    });
    email.count = labelCount;
    if (bestMention.mentions) {//if mentioned
        heading += "[" + bestMention.from.replace(/guest-/g, "") +  "] " + bestMention.text + " - on " + bestMention.to;
    }
    else {
        var tail = (more > 1 ? " +" + (more - 1) + " more": "");
        heading += "[" + bestLabel.room.substring(0,1).toUpperCase() + bestLabel.room.substring(1) + "] " +
            bestLabel.title + tail;
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
function sendperiodicMails(){
    var x = new Date().getUTCHours();
    var start1 = x >= 12?(24 - x)*60:-x*60;
    var end1 = start1 + 59;
    var start2 = -100*60;//big values
    var end2 = -200*60;
    if (emailConfig.debug) {
        start1=0;//for testing....
        end1=10000000;//for testing...
    }

    if (x >= 9 && x < 12) {
        start2 = 24*60 + start1;//(+12 +14 +13)
        end2 = start2 + 59;//+13
    }
    if (x == 12) {
        start2 = -12*60;
        end2 = start2 + 59;
    }
    log("current time hour:",x+","+start1+","+start2);
    var query = "SELECT accounts.id,members.user,members.room from accounts inner join members on" +
        " members.user=accounts.room where accounts.gateway='mailto' and `partedOn` is null"+
        " and timezone between ? and ?  or timezone between ? and ?";
    /*var query = "SELECT accounts.id,members.user,members.room from accounts inner join members on " +
     "members.user=accounts.room where accounts.gateway='mailto' order by accounts.id";
     */
    db.query(query, [start1, end1, start2, end2], function(error,data){
        if (error) {
            log("error in geting email member..",error);
            return;
        }
        log("data  returned:",data.length);
        var us = {};
        for (i = 0;i < data.length; i++){
            var d = data[i];
            if (!us[d.user]) {
                us[d.user] = [];
                us[d.user].rooms = [];
                us[d.user].email = d.id.replace(/mailto:/g, '');
            }
            us[d.user].rooms.push(d.room);
        }

        for (var key in us) { //send (key -user)
            var rm = us[key].rooms;//all rooms as array
            initMailSending(key, rm);
        }
    });
}