var log = require("../lib/logger.js");
var config = require('../config.js');
var net = require('net');
var timeout = 60 * 1000;
var redis = require('../lib/redisProxy.js').select(config.redisDB.threader);
var client;
var pendingCallbacks = {};
var core;

/**
Communicate with scrollback java Process through TCP and set message.threads.
*/
module.exports = function(coreObj) {
	core = coreObj;
	if (config.threader) {
		init();
		core.on('text', function(message, callback) {
			if(message.type == "text" && client.writable) {//if client connected and text message
				var threadId = message.threads && message.threads[0] ? message.threads[0].id : undefined;
				var msg = JSON.stringify({
					id: message.id, time: message.time, author: message.from.replace(/guest-/g,""),
					text: message.text/*.replace(/['"]/g, '').replace(/\n/g," ")*/,
					room: message.to,
					threadId: threadId
				});
				log("Sending msg to scrollback.jar= "+msg);
				try {
					client.write(msg + ",");
				} catch(err) {
					log("--error --"+err);
					callback();
					return;
				}
				pendingCallbacks[message.id] = { message: message, fn: callback ,time:new Date().getTime()};
				setTimeout(function() {
					if(pendingCallbacks[message.id] ){
						pendingCallbacks[message.id].fn();
						delete pendingCallbacks[message.id];
						log("pending callback removed after 1 sec for message.id" + message.id);
					}
				}, 1000);
			} else callback();
		}, "modifier");
	}
	else{
		log("threader module is not enabled");
	}
};

/**
*Process reply from java process and callback based on message.id
* message.thread [{
*	id: ..
*	title: ...
*	score: ... //sorted based on this score
* }, ... ]
*/
function processReply(data){
   try {
		log("data=-:" + data + ":-");
		data = JSON.parse(data);
		log("Data returned by scrollback.jar = "+data.threadId, pendingCallbacks[data.id].message.text);
		var id = data.threadId;
		var title = data.title;
	   	var bucketStatus = data.bucketStatus;
		if (bucketStatus === 'end') {
			redis.get("threader:last:" + id, function(err, d) {
				d = JSON.parse(d);
				if (d) {
					core.emit("text", {
						type: 'edit',
						ref: d.id,
						threads: [{id: id, title: title, score: 1}]
					});
				}
				redis.del("threader:last:" + id);
			});
		} else {
			var message = pendingCallbacks[data.id] && pendingCallbacks[data.id].message;
			if(message) {

				redis.get("threader:last:" + id, function(err, d) {
					message = pendingCallbacks[data.id] && pendingCallbacks[data.id].message;
					if (!message) return;
					d = JSON.parse(d);
					var tt = title;
					if(!message.threads) message.threads = [];
					if(d && d.title === title) title = undefined;
					if(!title) message.threads.push({id: id, score: 1});
					else message.threads.push({id: id, title: title, score: 1});
					if(bucketStatus === "New") message.labels.threadStart = 1;
					redis.set("threader:last:" + id, JSON.stringify({id: message.id, title: tt}));
					pendingCallbacks[data.id].fn();
					log("called back in ", new Date().getTime() - pendingCallbacks[data.id].time);
					delete pendingCallbacks[data.id];

				});

			}
		}
	} catch(err) {
		log("error on parsing data=" + err);
		return;
	}
}


function init(){
	log("Trying to connect.... ");
	client = net.connect({port: config.threader.port, host: config.threader.host},
		function() { //'connect' listener
		console.log('client connected');
		client.write("[");//sending array of JSON objects
	});
	var d = "";//wait for new line.
	client.on("data", function(data){
		var i;

		data = data.toString('utf8');
		data = data.split("\n");
		data[0] = d + data[0];//append previous data
		d = data[data.length-1];
		for (i = 0; i < data.length-1;i++) {
			processReply(data[i]);
		}
	});

	client.on('error', function(error){
		setTimeout(function(){
			init();
		}, timeout);//try to reconnect after 1 min
	});

	client.on('end', function() {
		log('connection terminated');
		setTimeout(function(){
			init();
		},timeout);//try to reconnect after 1 min
	});
}

