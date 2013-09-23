var log = require("../../lib/logger.js");
var fs = require("fs");

var roomNames = {};

function loadRoomNames(){
            log("Re-loading room names which require login!");
            fs.readFile(__dirname + "/roomNames.txt", "utf-8", function(err, data){
            var roomBuffer = {};
            if(err) throw err;
            
            data.split("/n").forEach(function(roomName){
                if(roomName){
                    roomName = roomName.toLowerCase().trim();
                    roomBuffer[roomName]=true;
                }
            });
            roomNames = roomBuffer;
    });

}

var init = function (){
    loadRoomNames();
    setInterval(loadRoomNames,60*60*1000);
}

loginRequired = function(r){
    if(roomNames[r]){
         log("Login is required for this room:" + r);
         return true;
    }
    return false;
};

module.exports = function(core){
    init();
    core.on("message", function(message, callback){
        if(message.origin && message.origin.indexOf("irc")==0) return callback();
        if(message.type == "text" && message.from.indexOf("guest-")==0 && loginRequired(message.to)){
              callback(new Error("AUTH_REQ_TO_POST")); 
        }
        else callback();
    });
}
