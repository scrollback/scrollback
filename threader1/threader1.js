var log = require("../lib/logger.js");
var config = require('../config.js');
var fs=require("fs");
var pro;//for process
var pendingCallbacks = {};
/**
Communicate with scrollback.jar and set message.labels.
*/

module.exports = function(core) {
	init();
	core.on('message', function(message, callback) {
		if(message.type== "text") {
			return core.emit('rooms', {id:message.to}, function(err, rooms) {
				if(rooms.params && rooms.params.threader1) {
					var msg = JSON.stringify({
						id: message.id, time: message.time, author: message.from.replace(/guest-/g,""),
						text: message.text.replace(/['"]/g, ''),
						room: message.to
					});
					log("Sending msg to scrollback.jar="+msg);
					try {
						pro.stdin.write(msg+'\n');
					} catch(err) {
						log("--error --"+err);
						return callback();
					}
					pendingCallbacks[message.id] = { message: message, fn: callback ,time:new Date().getTime()};
					setTimeout(function() { 
						if(pendingCallbacks[message.id] ){
							pendingCallbacks[message.id].fn();
							delete pendingCallbacks[message.id];
							log("pending callback removed after 1 sec for message.id"+message.id);
						}
					}, 1000);	
				}
			});
		}
		callback();
	}, "modifier");
};

function init(){
	log("core.uid=======",config.core);
	try{
		pro=require("child_process").spawn("java", ['-jar',__dirname	+'/scrollback.jar'],{ uid: config.core.uid });
	} catch(err){
		log("scrollback.jar Process Starting Failed");
		return;
	}
	pro.stdout.on("data", function(data){
		var message;
		log("data=:",data,":-",typeof data);
		data=data.toString('utf8');
		try {
			data=data.substring(data.indexOf('{'),data.indexOf('}')+1);
			log("data=-:"+data+":-");
			data = JSON.parse(data);
			console.log("Data returned by scrollback.jar="+data.threadId, pendingCallbacks[data.id].message.text);
			message = pendingCallbacks[data.id] && pendingCallbacks[data.id].message;
			if(message) {
				message.labels = [data.threadId];
				pendingCallbacks[data.id].fn();
				log("called back in ",new Date().getTime() - pendingCallbacks[data.id].time);
				delete pendingCallbacks[data.id];
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

