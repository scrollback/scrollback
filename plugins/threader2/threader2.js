var log = require("../../lib/logger.js");
var fs=require("fs");
var pro;//for process
var pendingCallbacks = {};
/**
Communicate with cloimpl-0.1.0-SNAPSHOT-standalone.jar and set message.labels.
*/

module.exports = function(core) {
	init();
	core.on('message', function(message, callback) {
		try{
			str = message.id + ' ' + message.time + ' ' + message.to + ' ' + message.from + ' ' +
				message.text.replace(/\n/g, ' ') + '\n';
			pro.stdin.write(str);
			pendingCallbacks[message.id] = { message: message, fn: callback };
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
		pro=require("child_process").exec("java -jar cloimpl-0.1.0-SNAPSHOT-standalone.jar");
	} catch(err){
		log("jar Process Starting Failed");
		return;
	}
	pro.stdout.on("data", function(data){
		var message;
		log("data=-:"+data+":-------");
		var d=data.split(" ");
		message=pendingCallbacks[d[0]]&&pendingCallbacks[d[0]].message;
		if (message) {
			message.labels=[message.to+"-"+d[1]];
			pendingCallbacks[d[0]].fn();
			delete pendingCallbacks[d[0]];
			log("called back");
		}
		
	});
	pro.stdout.on('error', function(err) {
		log("Error --", err);
	});
	log("--cloimpl-0.1.0-SNAPSHOT-standalone.jar prcess Execution successful--");
	
}

