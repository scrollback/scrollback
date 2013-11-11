var nodemailer = require('nodemailer');
var config = require('../config.js');
var log = require("../lib/logger.js");
var db = require('../core/data.js');
var redis = require('../core/redisProxy.js');
var fs=require("fs"),jade = require("jade");
var emailConfig = config.email, digestJade;
var core;
var transport = nodemailer.createTransport("SMTP", {
    host: "email-smtp.us-east-1.amazonaws.com",
    secureConnection: true,
    port: 465,
    auth: emailConfig.auth
});

function send(from,to,subject,html) {
    var email = {
        from: from,
        to: to,
        subject: subject,
        html: html
    };
    transport.sendMail(email, function(error) {
        if(!error)
            console.log('Test message sent successfully!');
        else
            console.log(error);
    });
}

module.exports = function(coreObject) {
    core = coreObject;
    //sendDigest();
    init();
    core.on('message', function(message, callback) {
        if(message.type === "text"){
            addMessage(message);    
        }
        callback();
    }, "gateway");
    //setInterval(sendDigest, 50*1000);

   
    
};

function init() {
    fs.readFile(__dirname + "/views/digest.jade", "utf8", function(err, data) {
        if(err) throw err;
        digestJade = jade.compile(data,  {basedir: process.cwd()+'/http/views/'});
        //send mails in next hour     
        setTimeout(function(){
            sendDigest();
            setInterval(sendDigest, 60*60*1000);
        },(60 - new Date().getMinutes())*60*1000);
    });
}

function getNumber(i){
    var x=[],j;
    for(j=0;j<i;j++)
        x.push(j);
    return x;
}
function addMessage(message){
    var room = message.to, i;
    getNumber(24).forEach(function(i){
        redis.sadd("email:room:" + i, room);
        redis.incr("email:" + room + ":" + i + ":count", function(err, d) {
            //is there a better way to handle this?
            if (err)    return log(err);
            redis.get("email:" + room + ":" + i + ":count",function(error,data){
                var count = parseInt(data);
                if (count < 4) {
                    redis.rpush("email:" + room + ":" + i + ":head",JSON.stringify(message));
                }
                else {
                    redis.rpush("email:" + room +":" + i +":tail",JSON.stringify(message));
                    if (count > 6) {
                        redis.ltrim("email:" + room + ":" + i + ":tail", 1, 3);
                    }
                }
            });
        }); 
        
    });
}
/**
 *@param {string} room (room:no)
 *@param {function} callback(error,data) callback with room data....
 */
function createMessage(room,callback) {
    var roomsData = {};
    redis.get("email:" + room + ":count", function (error,ct){//get msg count
        if (error) {
            return callback(error);
        }
        redis.lrange("email:" + room + ":head", 0, -1,function(error,head){// get head....
            if (error) {
                return callback(error);
            }
            log("head for room " ,room , head);
            roomsData.head =[];
            head.forEach(function(element){
                roomsData.head.push(JSON.parse(element));
            });
            roomsData.count = ct;
            redis.lrange("email:" + room +":tail", 0, -1,function(error,tail){//get tail...
                if (error) {
                    callback(error);
                }
                roomsData.tail = [];
                tail.forEach(function(element){
                    roomsData.tail.push(JSON.parse(element));
                });
                //room data making done for current room....                   
                 //clear room data....
                redis.del("email:" + room + ":head");
                redis.del("email:" + room + ":count");
                redis.del("email:" + room + ":tail");
                callback(null,roomsData);
            }); 
        });
    });//end get count   
}



/**
 *Read rooms data from redis and send mails.
 **/
function sendDigest() {
    var x = new Date().getUTCHours();
    var start = x*60;//x<=12? -x: 24-x,
    var end = start + 60;
    //message summery for rooms.
    redis.smembers("email:room:"+x, function(error,data){//get all rooms
        if (error) {
            return;
        }
        var roomsData = {};
        var count=0;
        var i=0;
        function next(callback) {
            createMessage(data[i] + ":" + x,function(error,rd){
                roomsData[data[i]] = rd;
                i++;
                if (i<data.length) {
                    next(callback);
                }
                else{
                    //delete all rooms...
                    redis.del("email:room:"+x,function(error,data){
                        callback();    
                    });
                }
            });
        }
        next(function(){
            log("sending mails....." ,roomsData);
             //send emails now....
            sendMails(roomsData);    
        });
    });
}

/**
 *Send mails to users based on current time.
 *@param {object} Map of room data.
 */
function sendMails(roomsData){
    var x = new Date().getUTCHours();
    var start = x*60;
    var end = start + 60;
    var query = "SELECT accounts.id,members.user,members.room from accounts inner join members on " +
                "members.user=accounts.room where accounts.gateway='mailto' and timezone between ? to ? "+
                "order by accounts.id";
    
    /*var query = "SELECT accounts.id,members.user,members.room from accounts inner join members on " +
                "members.user=accounts.room where accounts.gateway='mailto' order by accounts.id";
    */
    db.query(query, [start, end], function(error,data){
        if (error) {
            return;
        }
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
            log("email  :" + prepareEmail(key,rm,roomsData));
            send("askabt@askabt.in",us[key].email,getSubject(key,rm,roomsData),prepareEmail(key,rm,roomsData));
        }
    });
}
/**
 *@param {string} user
 *@param {array} rooms array
 *@param {object} Map of rooms data.
 *@returns {string} Subject Line for email.
 */
function getSubject(user,rooms,roomsData){
    var r = user+": ";
    r += "Updates from rooms ";
    for (i = 0;i < rooms.length;i++) {
        
        if (i < rooms.length-2) {
            r += rooms[i]+", ";    
        }
        else if (i === rooms.length-2) {
            r += rooms[i];
        }
        else{
            r += " and "+rooms[i];
        }   
    }
    return r;
}

/**
 *@param {string} user
 *@param {array} rooms array
 *@param {object} Map of rooms data.
 *@returns {string} emailHTML
 **/
function prepareEmail(user, rooms,roomsData) {
    log(user,rooms,roomsData);
    var obj = {
                user: user/*User name*/,
                room: rooms/*room array*/,
                roomsData: roomsData/*all rooms info*/
            };
    return digestJade(obj);
}   