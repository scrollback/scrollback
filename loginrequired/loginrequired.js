var log = require("../lib/logger.js");
var fs = require("fs");
var jade = require("jade");
var core;
var roomNames = {};


module.exports = function(coreObject) {
    var pluginContent = "";
    core=coreObject;
    fs.readFile(__dirname + "/loginrequired.jade", "utf8", function(err, data){
        if(err) throw err;
        pluginContent = jade.compile(data,  {basedir: process.cwd()+'/http/views/'});
        core.on("config", function(payload, callback) {
            payload.loginrequired = pluginContent;
            callback(null, payload);
        }, "setters");
    });
   core.on("message", function(message, callback) {
        log("Heard \"message\" Event");
        if (message.origin && message.origin.gateway == "irc") return callback();
        if(message.type == "text" && message.from.indexOf("guest-")==0) {
            core.emit("rooms",{id:message.to},function(err, data) {
                if(data.params && data.params.loginrequired)
                    callback(new Error("AUTH_REQ_TO_POST"));
                else callback();
            });
        }
        else callback();
    }, "authorization");
}
