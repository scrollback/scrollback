var nodemailer = require('nodemailer');
var config = require('../config.js');
var log = require("../lib/logger.js");
var db = require('../lib/mysql.js');
var redis = require('../lib/redisProxy.js');
var fs=require("fs"),jade = require("jade");
var emailConfig = config.email, digestJade;
var welcomeEmailJade;
var core;
var debug = true;
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
    log("sending email :", email);
    transport.sendMail(email, function(error) {
        if(!error){
            log('Test message sent successfully!');
        }
        else{
            log("error in sending email: ",error);
            log("retrying......");
            setTimeout(function(){
                send(email.from, email.to, email.subject, email.html);
            },300000);
        }
    });
}

module.exports = function(coreObject) {
    core = coreObject;
   
    if (config.email) {
        init();
        
        core.on('room', function(user, callback ){
            callback();
            if(user && user.type == 'user' && user.old === null) {//Signup
                sendWelcomeEmail(user);     
            }
        });
        
        core.on('message', function(message, callback) {
            log("Heard \"message\" event", message);
            callback();
            if(message.type === "text"){
                addMessage(message);    
            }
            
        }, "gateway");
        //TODO Delete this before pushing...
        if (debug) {
           setInterval(sendperiodicMails, 25*1000);
        }
    }
    else {
        log("email module is not enabled");
    }
};

function test() {
    console.log(welcomeEmailJade());
}


function init() {
    fs.readFile(__dirname + "/views/digest.jade", "utf8", function(err, data) {
        if(err) throw err;
        digestJade = jade.compile(data,  {filename : __dirname + "/views/digest.jade" ,basedir: __dirname + "/views/" });
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
    });
    //read welcome email jade
    fs.readFile(__dirname + "/views/welcomeEmail.jade", "utf8", function(err, data) {
        if(err) throw err;
        welcomeEmailJade = jade.compile(data,  {filename : __dirname + "/views/welcomeEmail.jade", basedir: __dirname + "/views/"});
        if (debug) {
             test();
        }
       
        log("welcome emails " , welcomeEmailJade );
    });
}

function getExpireTime() {
    return 24*60*60*1000;
}

/**
 *Push message into redis
 */
function addMessage(message){
    var room = message.to;
    log("email -"  , message);
    
    if (message.labels && message.labels[0]) {
        var label = message.labels[0].substring(0,message.labels[0].indexOf(':'));
        var title = message.labels[0].substring(message.labels[0].indexOf(':') + 1);
        redis.zadd("email:label:" + room + ":labels" ,message.time , label); // email: roomname : labels is a sorted set
        // this can be used to remove elements from set ZREMRANGEBYSCORE email:scrollback:labels -1 1389265655284
        redis.incr("email:label:" + room + ":" + label + ":count");
        redis.expire("email:label:" + room + ":" + label + ":count" , getExpireTime());
        redis.set("email:label:" + room + ":" + label + ":title", title);
        redis.expire("email:label:" + room + ":" + label + ":title" , getExpireTime());
        redis.set("email:label:" + room + ":" + label +":last", JSON.stringify(message));//last message of label
        redis.expire("email:label:" + room + ":" + label + ":last" , getExpireTime());
        
    }
    
    if (message.mentions) {
        message.mentions.forEach(function(username) {
            redis.sadd("email:mentions:" + room + ":" + username , JSON.stringify(message), function(err,data) {
                if (!err) {
                    initMailSending(username);
                }
                
            });//mention is a set
            
            
        });
                
    }
}


/**
 *Init of mail sending to username
 *1 - after 24 hours
 *2 - On nick mantion and at least {@link config.emailTimeout}
 *@param {string} username username
 *@param {string}(optional) rooms rooms followed by username.
 */
function initMailSending(username, rooms) {
    log("init mail sending for user  " + username, " rooms ", rooms);
    log("gettting last email sent to user" , username);
    redis.get("email:" + username + ":lastsent",function(err, data) {
        log("data returned form redis", data);
        if (err) {
            return;
        }
        var ct = new Date().getTime();
        var interval = 1000*60*2;//millisec
        if (!data) {//last email sent not set
            data = ct - interval;
        }
        log("time left for user " , (parseInt(data) + interval - ct));
        if (parseInt(data) + interval <= ct) {
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
                    prepareEmailObj(username, rooms, function(err, email) {
                        log(err + " callback of pre email" , email);
                        if (!err) {
                            sendMail(email);
                        }   
                    });
                });
            }
            else {
                prepareEmailObj(username, rooms, function(err, email) {
                    log(err + " callback of pre email" , email);
                    if (!err) {
                        sendMail(email);
                    }
                    
                });
            }
        }
        else {
            log("can not send email to user ", username, " now" );
            return;
        }
    });
    
    //last send mail 
        //if rooms not given as input get all rooms He is following...
        
                
}




/**
 *send mail to user read data from redis and create mail object
 *@param {string} username
 *@param {string} rooms all rooms that user is following
 *@param {function(err, email) } callback if err.
 */
function prepareEmailObj(username ,rooms, callback) {
    log("send mail to user ", username , rooms);
     
    var email = {};
    email.username = username;
    email.rooms = [];
    var ct = 0;
    var vq = 0;
    rooms.forEach(function(room) {
        log("starting for rooom " , room);
        var roomsObj = [];
        var qc = 0;
        var m = "email:mentions:" + room + ":" + username ;
        redis.smembers(m, function(err, mentions) {
            if (!err) {
                log("mentions returned from redis ", room ,mentions);
                var l = "email:label:" + room + ":labels";
                
                redis.zrange(l ,0, -1, function(err,labels) {
                    log("labels returned from redis" , labels);
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
                                         count : count                            
                                     };
                                    roomsObj.labels.push(ll);
                                    done(roomsObj, mentions);
                                }
                            });
                        });
                        if (!isLabel) {
                            isNoLabel();
                            ct++;
                        } 
                    }
                    else {
                        callback(err);
                    }
                    
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
                        log("email object creation complete" , email);
                        callback(null, email);
                    }   
                }
            });
        }
        
    });
    
   
    
    
    //for each room
            //get all mentions
            //get all labels for that room
            //filter out labels based on
                //count of msg
                //mentions..
}

/**
 *create email.rooms element
 */
function sortLabels(room, roomObj, mentions,callback) {
    var maxLabels = 5;//   
    log("sort labels");
    var r = {};
    var ct = 0;
    r.id = room;
    r.totalCount = roomObj.totalCount;
    r.labels = [];
    roomObj.labels.forEach(function(label) {
        label.interesting = [];
        mentions.forEach(function(m) {
            log("m------>" , m);
            m = JSON.parse(m);
            
           if(m.labels[0].split(":")[0] === label.label) {
                label.interesting.push(m);    
           }
        });
        ct++;
        //log("label m" , label);
        redis.get("email:label:" + room + ":" + label.label + ":last", function(err, lastMsg) {
            if (lastMsg) label.interesting.push(lastMsg);
            //log("label m", label );
            log("last msg " , lastMsg);
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
            //log("room Obj", rm , label,r);
            r.labels.splice(pos,0,label);
            if (rm != -1) {
                r.labels.splice(0,rm);
            }
            done();
        });
         
    });
    function done() {
        if (--ct > 0) {
            return;
        }
        log("room Obj " , JSON.stringify(r));
        callback(null, r);
        //filter out email 
    }
   // log("sortLabels " , room, roomObj, mentions);
    
}


function sendMail(email) {
    core.emit("rooms", {id: email.username, fields:["accounts"]}, function(err,rooms) {
        log("accounts " ,rooms);
        if (rooms && rooms[0].accounts) {
            rooms[0].accounts.forEach(function(e) {
                 log("accounts " ,rooms[0].accounts  , e);
                if (e.id.indexOf("mailto:") === 0) {
                    email.emailId = e.id.substring(7);
                    email.heading = getHeading(email);
                    var html = digestJade(email);
                    log(email , "sending email to user " , html);
                    send("scrollback@scrollback.io", email.emailId, email.heading, html);
                    redis.set("email:" + email.username + ":lastsent", new Date().getTime());
                    email.rooms.forEach(function(room) {
                        redis.zremrangebyscore("email:label:" + room.id + ":labels", 0, new Date().getTime() , function(err, data) {//TODO set expire time 
                            log("deleted old labels from that room " , err ,data);
                        });//ZREMRANGEBYSCORE email:scrollback:labels -1 1389265655284
                    });
                }
                
            });
            
        }
    });
}

function getHeading(email) {
    return "Hi ";
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
    if (debug) {
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
 *@param {string} user
 *@param {array} rooms array
 *@param {object} Map of rooms data.
 *@returns {string} Subject Line for email.
 */

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
        log("sending welcome email." , emailAdd)
        send("scrollback@scrollback.io", emailAdd, "Welcome", emailHtml);
    }
    
}