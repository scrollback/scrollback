var log = require("../../lib/logger.js");
var fs = require("fs");
var jade = require("jade");
var core;
var roomNames = {};

function loadRoomNames(){
    log("Re-loading room names which require login!");
    fs.readFile(__dirname + "/roomNames.txt", "utf-8", function(err, data){
        var roomBuffer = {};
        if(err) throw err;
        
        data.split("\n").forEach(function(roomName){
            if(roomName){
                roomName = roomName.toLowerCase().trim();
                roomBuffer[roomName]=true;
            }
        });
        console.log("LOGIN ",roomBuffer);
        roomNames = roomBuffer;
    });
}

var init = function (){
    loadRoomNames();
    setInterval(loadRoomNames,60*60*1000);
}

module.exports = function(coreObject) {
    init();
    var pluginContent = "";
    core=coreObject;
    fs.readFile(__dirname + "/loginrequired.jade", "utf8", function(err, data){
        if(err) throw err;
        //this is a function object. 
        pluginContent = jade.compile(data,  {basedir: process.cwd()+'/gate/http/views/' });
        core.setConfigUi("loginrequired", function(object){
            return pluginContent(object);
        });
    });
    core.on("message", function(message, callback){
        if (message.origin && message.origin.gateway == "irc") return callback();
        if(message.type == "text" && message.from.indexOf("guest-")==0) {
            core.room(message.to,function(err, data) {
                console.log(err,data);
                if(data.params.loginrequired)
                    callback(new Error("AUTH_REQ_TO_POST"));
                else callback();
            });
        }
        else callback();
    });
}
