var nodemailer = require('nodemailer');
var config = require('../../config.js');
var log = require("../../lib/logger.js");
var db = require('../../core/data.js');
var fs=require("fs"),jade = require("jade");
var emailConfig = config.email, digestJade;
var core;
var emailRooms = {};

var transport = nodemailer.createTransport("SMTP", {
    host: "email-smtp.us-east-1.amazonaws.com",
    secureConnection: true,
    port: 465,
    auth: emailConfig.auth
});

exports.send = function(from,to,subject,html) {
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

module.exports = function(coreObject) {
    core = coreObject;
    //sendDigest();
    init();
    core.on('message', function(message, callback) {
        log("Listening");
        if(message.type === "text"){
            addMessage(message);    
        }
        callback();
    }, "gateway");
    setInterval(sendDigest,5*1000);
};

function addMessage(message){
    var room = message.to;
    var m = message.from.replace(/guest-/g, '') + " : " + message.text;
    if (emailRooms[room]) {
        if (emailRooms[room].head.length < 3) {//if first 3 messages
            emailRooms[room].head.push(m);
        }
        else{
            if(!emailRooms[room].count){
                emailRooms[room].count = 3;
            }
            if(!emailRooms[room].tail){
                emailRooms[room].tail = [];
            }
            if (emailRooms[room].tail.length == 3) {
                emailRooms[room].tail.shift();
            }
            emailRooms[room].count++;
            emailRooms[room].tail.push(m);
        }
    }
    else{
        emailRooms[room] = {};
        emailRooms[room].head = [];
        emailRooms[room].head.push(m);
    }
    log(emailRooms);
    log(createMessage(room));
}
/**
 *@param {string} room 
 *@returns {string} prepared email text for a room.
 */
function createMessage(room) {
    var ret = "";
    if(!emailRooms[room])return "";
    for(i=0;i<emailRooms[room].head.length;i++){
        ret +=emailRooms[room].head[i]+"\n";
    }
    if (!emailRooms[room].tail) {
        return ret;
    }
    else{
        if (emailRooms[room].count>6) {
            ret += emailRooms[room].count+" messages"+"\n";
        }
        for(i = 0; i < emailRooms[room].tail.length; i++){
            ret += emailRooms[room].tail[i] + "\n";
        }   
    }
    return ret;
}


function init() {
    fs.readFile(__dirname + "/views/digest.jade", "utf8", function(err, data) {
        if(err) throw err;
        digestJade = data;//jade.compile(data,  {basedir: process.cwd()+'/plugins/http/views/'});
    });
   // setTimeout(sendDigest, (90-new Date().getMinutes())*60000);
}

function sendDigest() {
    /**
     * select accounts.id,members.room from accounts inner join members on
     * members.user=accounts.room where accounts.gateway='mailto' order by accounts.id;
     **/
    var x = new Date().getUTCHours(),
    start = x<=12? -x: 24-x,
    end = start + 1;
    var since = new Date().getTime()-(24*60*60*1000);
    var query = "SELECT accounts.id,members.user,members.room from accounts inner join members on " +
                "members.user=accounts.room where accounts.gateway='mailto' order by accounts.id";    
    log("DB=----------------- query");
    db.query(query, [], function(error,data){
        log("DB=----------------- query",data);
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
        for (var key in us) {
            //send (key -user) 
            var rm = us[key].rooms;//all rooms as array
            log("email  :" + prepareEmail(key,rm));
        }
        
    });
    
    
   // setTimeout(sendDigest, (90-new Date().getMinutes())*60000);
}

function prepareEmail(user, rooms) {
    log(user,rooms);
    var roomsData = {};
    for(i = 0;i < rooms.length;i++){
        roomsData[rooms[i]] = createMessage(rooms[i]);
    }
    var fn = jade.render(digestJade,{user: user/*User name*/, room: rooms/*room array*/,
                         roomsData: roomsData/*all room info*/});
    return fn;      
}   