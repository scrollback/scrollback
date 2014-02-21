var log = require("../lib/logger.js");
var config = require('../config.js');
var fs=require("fs");
var net = require('net');
var jade = require("jade")
var client;
var pendingCallbacks = {};
/**
Communicate with scrollback java Process through TCP and set message.labels.
Add labels only if threader is enabled for room.
*/

module.exports = function(core) {
	if (config.threader) {
		var pluginContent = "";
		/*fs.readFile(__dirname + "/threader.html", "utf8", function(err, data){
			if(err)	throw err;
			core.on("config", function(payload, callback) {
				payload.threader = data;
				callback(null, payload);
			}, "setters");
		});*/
		init();
		core.on('message', function(message, callback) {
			if(message.type == "text" && client.writable) {//if client connected and text message
				return core.emit('rooms', {id:message.to}, function(err, rooms) {
					console.log("threader",rooms);
					if(err) callback(err);
					//if(rooms.length !== 0 && (rooms[0].params && rooms[0].params.threader)) {//if threader is enabled or not for room 
					//if(true){
					var msg = JSON.stringify({
						id: message.id, time: message.time, author: message.from.replace(/guest-/g,""),
						text: message.text.replace(/['"]/g, ''),
						room: typeof message.to=="string" ? message.to:message.to[0]
					});
					log("Sending msg to scrollback.jar="+msg);
					try {
						msg = msg.replace(/\n/g," ");
						client.write(msg+'\n');
					} catch(err) {
						log("--error --"+err);
						return callback();
					}
					pendingCallbacks[message.id] = { message: message, fn: callback ,time:new Date().getTime()};
					setTimeout(function() { 
						if(pendingCallbacks[message.id] ){
							pendingCallbacks[message.id].fn();
							delete pendingCallbacks[message.id];
							log("pending callback removed after 1 sec for message.id" + message.id);
						}
					}, 1000);	
					/*}else{
						return callback();	
					}*/
					
				});
			}
			return callback();
		}, "modifier");
	}
	else{
		log("threader module is not enabled");
	}
};

function init(){
	log("Trying to connect.... ");
	client = net.connect({port: config.threader.port, host: config.threader.host},
		function() { //'connect' listener
		console.log('client connected');
	});
	var d = "";//wait for new line.
	client.on("data", function(data){
		data = data.toString('utf8');
		data = data.split("\n");
		data[0] = d + data[0];//append previous data
		d = data[data.length-1];
		for (i = 0;i < data.length-1;i++) {
			processReply(data[i]);
		}
	});
	/**
	 *Process reply from java process and callback based on message.id
	 */
	function processReply(data){
		var message;
		try {
			log("data=-:" + data + ":-");
			data = JSON.parse(data);
//			console.log("Data returned by scrollback.jar="+data.threadId, pendingCallbacks[data.id].message.text);
			message = pendingCallbacks[data.id] && pendingCallbacks[data.id].message;
			if(message) {
				message.labels = [data.threadId];
				pendingCallbacks[data.id].fn();
				log("called back in ", new Date().getTime() - pendingCallbacks[data.id].time);
				delete pendingCallbacks[data.id];
			}
			else
				return;
		} catch(err) {
			log("error on parsing data="+err);
			return;
		}
	}
	
	client.on('error', function(error){
		log("Can not connect to java Process ", error);
		setTimeout(function(){
			init();	
		},1000*60);//try to reconnect after 1 min
	});
	client.on('end', function() {
		log('connection terminated');
		setTimeout(function(){
			init();	
		},1000*60);//try to reconnect after 1 min
		
		
	});
}

