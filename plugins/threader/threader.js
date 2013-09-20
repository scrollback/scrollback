var log = require("../../lib/logger.js");
var fs=require("fs");
var pro;//for process
var pendingCallbacks = {};


module.exports = function(core) {
	init();
	core.on('message', function(message, callback) {
		try{
			//log("-----writting on process----"+process.toString());
			var msg='{"id":"'+message.id+'","time":'+message.time+',"author":"'+message.from+'","text":"'+message.text+'","room":"'+message.to+'"}';
			log("Sending msg to scrollback.jar="+msg);
			pro.stdin.write(msg+'\n');
			pendingCallbacks[message.id] = { message: message, fn: callback };
		}catch(err){
			log("--error--"+err);
		}
	});
};

function init(){
	try{
		pro=require("child_process").exec("java -jar scrollback.jar");
		// Come back to this.
		pro.stdout.on("data", function(data){
			var message;
			log("data=-------:"+data+":-------");
			try {
				data=data.substring(data.indexOf('{'),data.indexOf('}')+1);
				log("data=----:"+data+":----------");
				data = JSON.parse(data);
				console.log("Data returned by scrollback.jar="+data.threadId, pendingCallbacks[data.id].message.text);
				message = pendingCallbacks[data.id].message;
				if(message) {
					message.threadId = data.threadId;
					pendingCallbacks[data.id].fn();
					delete pendingCallbacks[data.id];
					log("called back"+pendingCallbacks[data.id]);
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
	} catch(err){
		log("scrollback.jar Process Starting Failed");
		return;
	}
	log("--------------Scrollback.jar prcess Execution successful-------------");
	
}