var nodemailer = require('nodemailer');
var config = require('../config.js');
var log = require("../lib/logger.js"),
    logMail = log;
var db = require('../lib/mysql.js');
var redis = require("redis").createClient();//require('../lib/redisProxy.js');
var fs=require("fs"),jade = require("jade");
var emailConfig = config.email, digestJade;
var welcomeEmailJade;
var core;
var waitingTime1 = 3*60*60*1000;//mention email timeout
var waitingTime2 = 12*60*60*1000;//regular email timeout 
var timeout = 5*60*1000;//for debuging only
var transport = nodemailer.createTransport("SMTP", {
    host: "email-smtp.us-east-1.amazonaws.com",
    secureConnection: true,
    port: 465,
    auth: emailConfig && emailConfig.auth
});

function send(from,to,subject,html) {
    
    var email = {
        from: from,
        to: to,
        subject: subject,
        html: html
    };
    if (emailConfig && emailConfig.bcc) {
        email.bcc = emailConfig.bcc;
    }
    
    if (emailConfig.debug) {
        log("sending email :", email);
    }
    transport.sendMail(email, function(error) {
        if(!error){
            logMail('Test message sent successfully!');
        }
        else{
            logMail("error in sending email: ",error, "retrying...");
            setTimeout(function(){
                send(email.from, email.to, email.subject, email.html);
            },300000);
        }
    });
}

module.exports = function(coreObject) {
    core = coreObject;
    process.nextTick(function(){
       logMail = log.tag('mail'); 
    });
    if (config.email && config.email.auth) {
        init();
        
       /*
        *for Welcome email sending..
        * core.on('room', function(user, callback ){
            callback();
            if(user && user.type == 'user' && user.old === null) {//Signup
                sendWelcomeEmail(user);     
            }
        });
        */
        core.on('message', function(message, callback) {
            logMail("Heard \"message\" event", message);
            callback();
            if(message.type === "text"){
                addMessage(message);    
            }
            
        }, "gateway");
        if (emailConfig.debug) {
           setInterval(sendperiodicMails, timeout);
           setInterval(trySendingToUsers,timeout/8);
        }
    }
    else {
        logMail("email module is not enabled");
    }
};


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
    //read welcome email jade
    fs.readFile(__dirname + "/views/welcomeEmail.jade", "utf8", function(err, data) {
        if(err) throw err;
        welcomeEmailJade = jade.compile(data,  {basedir: __dirname + "/views/"});
        log("welcome emails " , welcomeEmailJade );
    });
}



function getExpireTime() {
    if (emailConfig.debug) {
        return timeout*2;
    }
    else return 2*24*60*60;//2 days
}

/**
 *Push message into redis
 *If labels is not defind then it will not send mentions email.
 *and not add data into redis.
 */
function addMessage(message){
    var room = message.to;
    
    if(emailConfig.debug) log("email -"  , message);
    
    if (message.labels && message.labels[0]) {
        var label = message.labels[0].substring(0,message.labels[0].indexOf(':'));
        var title = message.labels[0].substring(message.labels[0].indexOf(':') + 1);
        var multi = redis.multi();
        multi.zadd("email:label:" + room + ":labels" ,message.time , label); // email: roomname : labels is a sorted set
        multi.incr("email:label:" + room + ":" + label + ":count");
        multi.expire("email:label:" + room + ":" + label + ":count" , getExpireTime());
        multi.set("email:label:" + room + ":" + label + ":title", title);
        multi.expire("email:label:" + room + ":" + label + ":title" , getExpireTime());
        multi.lpush("email:label:" + room + ":" + label +":tail", JSON.stringify(message));//last message of label
        multi.ltrim("email:label:" + room + ":" + label +":tail", 0, 2);
        multi.expire("email:label:" + room + ":" + label + ":tail" , getExpireTime());
        multi.exec(function(err,replies) {
            logMail("added message in redis" , err, replies);
        });
        if (message.mentions) {
            message.mentions.forEach(function(username) {
                var multi = redis.multi();
                multi.sadd("email:mentions:" + room + ":" + username , JSON.stringify(message));//mentioned msg
                multi.set("email:" + username + ":isMentioned", true);//mentioned indicator for username
                multi.exec(function(err,replies) {
                    logMail("added mention ", replies);
                    if (!err) {
                        initMailSending(username);
                    }
                });//mention is a set)
            });        
        }
    }
    
    
}

/**
 *Try sending mail to waiting users.
 *Reads email:toSend from redis.
 */
function trySendingToUsers() {
    
    redis.smembers("email:toSend", function(err,usernames) {
       if(!err && usernames) {
            if (emailConfig.debug) {
                logMail("checking for mentions...", usernames);
            }
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
 *2 - On nick mantion
 *3 - Priodic check for mention timeout.
 *@param {string} username username
 *@param {array of string}(optional) rooms rooms followed by username.
 */
function initMailSending(username, rooms) {
    logMail("init mail sending for user  " + username, " rooms ", rooms);
    logMail("gettting last email sent to user" , username);
    redis.get("email:" + username + ":lastsent",function(err, lastSent) {
        logMail("data returned form redis", lastSent);
        if (err) {
            return;
        }
        
        redis.get("email:" + username + ":isMentioned", function(err, data) {
            var ct = new Date().getTime();
            var interval = waitingTime2 ;
            if (data) {
                interval = waitingTime1
            }
            if (emailConfig.debug) {
                logMail("username " + username + " is mentioned ", data); 
                interval = timeout/2;
                if (data) {
                    interval = timeout/8;
                }
                logMail("interval " , interval);
            }
            if (!lastSent ) {//last email sent not set
                lastSent = ct - interval;
            }
            
            
            log("time left for user " , (parseInt(lastSent) + interval - ct));
            if (parseInt(lastSent) + interval <= ct) {
                //get rooms that user is following...
                if (!rooms) {
                    logMail("getting rooms that user is following....");
                    core.emit("members",{user: username},function(err,following) {//TODO get only rooms from DB
                        if (err) {
                           logMail("error in getting members informtion");
                            return;
                        }
                        logMail("username ", username ," is following rooms ", following);
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
                            logMail(err + " callback of pre email" , email);
                        }
                        if (!err) {
                            sendMail(email);
                        }
                        
                    });
                }
                redis.srem("email:toSend", username);
            }
            else {
                logMail("can not send email to user ", username, " now" );
                redis.sadd("email:toSend", username);
                return;
            }    
        });
        
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
                                         count : parseInt(count)                            
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
            logMail("room done......" , room , qc);
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
                        logMail("email object creation complete" , JSON.stringify(email));
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
 *@param {string} room
 */
function deleteMentions(username , rooms) {   
    rooms.forEach(function(room) {
        var m = "email:mentions:" + room + ":" + username ;
        var multi = redis.multi();
        multi.del(m);
        m = "email:" + username + ":isMentioned";
        multi.del(m);
        multi.exec(function(replies) {
           logMail("mentions deleted" , replies); 
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
    logMail("sort labels");
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
                label.title = m.labels[0].split(":")[1];
           }
        });
        ct++;
        redis.get ("email:label:" + room + ":" + label.label + ":title",function(err, title) {
            
            if (title) {
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
        logMail("room Obj " , JSON.stringify(r));
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
                    email.heading = getHeading(email);
                    log("email object" + JSON.stringify(email));
                    var html = digestJade(email);
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
                            logMail("deleted old labels from that room " , err ,data);
                        });//ZREMRANGEBYSCORE email:scrollback:labels -1 1389265655284
                    });
                }
                
            });
            
        }
    });
}
/**
 *
 *Generate Heading from email Object
 *@param {object} Email Object
 */
function getHeading(email) {
    var heading = "";
    var bestLabel ;
    var bestMention = {};
    var r ;
    var isLable = false;
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
            logMail("best label", bestLabel);
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
}



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


/**
 *send welcome mail to user
 *@param {Object} user 
 */
function sendWelcomeEmail(user) {
    var emailHtml = welcomeEmailJade(user);
    var emailAdd = false;
    user.accounts.forEach(function (u) {
        if (u.id.indexOf('mailto:') === 0) {
            emailAdd = u.id.substring(7);
        }
    });
    if (emailAdd) {
        logMail("sending welcome email." , emailAdd);
        send(emailConfig.from, emailAdd, "Welcome", emailHtml);
    }
    
}