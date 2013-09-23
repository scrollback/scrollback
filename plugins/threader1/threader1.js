var log = require("../../lib/logger.js");
var fs=require("fs");
var pro;//for process
var pendingCallbacks = {};
/**
Communicate with scrollback.jar and set message.labels.
*/

module.exports = function(core) {
	init();
	core.on('message', function(message, callback) {
		try{
			var msg='{"id":"'+message.id+'","time":'+message.time+',"author":"'+message.from+
				'","text":"'+message.text+'","room":"'+message.to+'"}';
			log("Sending msg to scrollback.jar="+msg);
			pro.stdin.write(msg+'\n');
			pendingCallbacks[message.id] = { message: message, fn: callback};
			setTimeout(function() { 
				if(pendingCallbacks[message.id] ){
					pendingCallbacks[message.id].fn();
					delete pendingCallbacks[message.id];
					log("pending callback removed after 1 sec for message.id"+message.id);
				}
			}, 1000);
		}catch(err){
			log("--error--"+err);
		}
	});
};

function init(){
	try{
		pro=require("child_process").exec("java -jar scrollback.jar");
	} catch(err){
		log("scrollback.jar Process Starting Failed");
		return;
	}
	
	pro.stdout.on("data", function(data){
		var message;
		log("data=:"+data+":-");
		try {
			data=data.substring(data.indexOf('{'),data.indexOf('}')+1);
			log("data=-:"+data+":-");
			data = JSON.parse(data);
			console.log("Data returned by scrollback.jar="+data.threadId, pendingCallbacks[data.id].message.text);
			message = pendingCallbacks[data.id] && pendingCallbacks[data.id].message;
			if(message) {
				message.labels = [data.threadId];
				pendingCallbacks[data.id].fn();
				delete pendingCallbacks[data.id];
				log("called back");
			}
			else
				return;
		} catch(err) {
			log("error on parsing data="+err);
			return;
		}
	});
	pro.stdout.on('error', function(err) {
		log("Error", err);
	});
	log("-Scrollback.jar prcess Execution successful-");
	
}

