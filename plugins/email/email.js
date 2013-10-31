var nodemailer = require('nodemailer');
var config = require('../../config.js');
var log = require("../../lib/logger.js");
var fs=require("fs"), jade = require("jade");
var emailConfig = config.email, digestJade;
var core;
var transport = nodemailer.createTransport("SMTP", {
    host: "email-smtp.us-east-1.amazonaws.com",
    secureConnection: true,
    port: 465,
    auth: emailConfig.auth
});

exports.send = function sendTest(from,to,subject,html) {
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
};

modules.exports = function(coreObject) {
    core = coreObject;
    init();
};

function init() {
    fs.readFile(__dirname + "/views/digest.jade", "utf8", function(err, data) {
        if(err) throw err;
        digestJade = jade.compile(data,  {basedir: process.cwd()+'/plugins/http/views/'});
    });
    setTimeout(sendDigest, (90-new Date().getMinutes())*60000);
};



function sendDigest() {
    var x = new Date().getUTCHours(),
    start = x<=12? -x: 24-x,
    end = start + 1;
    // this has to change to someother way of getting all the rooms...
    redisProxy.smembers("rooms", function(err, allRooms) {
        var digest;
        core.members({ room:allRooms}, function(err, data) {
            var ids={}, rooms={}, userIds;
            if(err){
                log(err);
                return;
            }
            
            data.forEach(function(element) {
                if(!ids[element.user]) ids[element.user] = [];
                ids[element.user].push(element.room);
                if(!rooms[element.room]) rooms[element.room] = {id: element.room}
            });

            userIds = Object.keys(ids);

            // ok how do i get the messages of each and every room.. hmmm :-|
            core.messages({ type:"text", to:Object.keys(rooms) },function(err, roomsData) {
                core.users({id: userIds, timezoneRange:[start*60,end*60]}, function(err, data) {
                    if(err) {
                        log(err);
                        return;
                    }
                    data.forEach(function(element) {
                        var user = element;
                        user.rooms = ids[element.user];
                        sendEmail(user);
                    });
                });
            });
        });
    });
    setTimeout(sendDigest, (90-new Date().getMinutes())*60000);
}

function sendEmail(user) {
    
}

function constructDigestFor(room, callback) {
    var time = new Date().getTime()-(1000*60*60*24);
    core.messages({since:time, to: room}, function(err, messages) {
        if(err) return callback(err);

        //use digestJade after creating the view file.. 
        return callback(null,"<h1> There are "+messages.length+" messages. </h1>");
    });
}