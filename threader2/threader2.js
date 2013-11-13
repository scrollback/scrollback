var log = require("../lib/logger.js");
var fs=require("fs");
var config = require('../config.js');
var pro;//for process
var pendingCallbacks = {};
/**
Communicate with cloimpl-0.1.0-SNAPSHOT-standalone.jar and set message.labels.
*/

module.exports = function(core) {
	init();
	core.on('message', function(message, callback) {
		str = message.id + ' ' + Math.floor(message.time/1000) + ' ' + message.to + ' ' + message.from.replace(/guest-/g,"") + ' ' +
			message.text.replace(/\n/g, ' ') + '\n';
		log("sending data:"+str);
		try{
			pro.stdin.write(str);
		}catch(err){
			log("--error--"+err);
			return callback();
		}
		pendingCallbacks[message.id] = { message: message, fn: callback, time:new Date().getTime() };
		setTimeout(function() { 
			if(pendingCallbacks[message.id] ){
				pendingCallbacks[message.id].fn();
				delete pendingCallbacks[message.id];
				log("pending callback removed after 1 sec for message.id"+message.id);
			}
		}, 1000);
	}, "modifier");
};

function init(){
	try{
		pro=require("child_process").spawn("java",['-jar',__dirname+'/cloimpl-0.1.0-SNAPSHOT-standalone.jar'],{ uid: config.core.uid });
	} catch(err){
		log("jar Process Starting Failed");
		return;
	}
	pro.stdout.on("data", function(data){
		var message;
		log("data=-:"+data+":-------");
		data=data.toString("utf8");
		var d=data.split(" ");
		message = pendingCallbacks[d[0]] && pendingCallbacks[d[0]].message;
		if (message) {
			message.labels=[message.to+"-"+d[1]];
			pendingCallbacks[d[0]].fn();	
			log("called back in ", new Date().getTime() - pendingCallbacks[d[0]].time);
			delete pendingCallbacks[d[0]];
		}
		
	});
	pro.stdout.on('error', function(err) {
		log("Error --", err);
	});
	log("--cloimpl-0.1.0-SNAPSHOT-standalone.jar prcess Execution successful--");
	
}

