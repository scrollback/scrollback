var log = require("../lib/logger.js"),
	config, net = require('net'), timeout = 60 * 1000,
	client, pendingCallbacks = {}, core,
	validator = new (require('valid'))(),
	colors, redis;

var threaderValidator = {
	params: [{
		threader: ['undefined', {
			enabled: ['boolean']
		}]
	}]
};
/**
Communicate with scrollback java Process through TCP and set message.threads.
*/
module.exports = function(coreObj, conf) {
	core = coreObj;
	config = conf;
	redis = require('redis').createClient();
	redis.select(config.redisDB);
	colors = require('./colors.js')(redis, config);
	if (config) {
		init();
		core.on("room", function(action, callback) {
			var result = validator.validate(action.room, threaderValidator);
			if (!result.status) {
				log.e("Error: invalid action params", JSON.stringify(result), " ID: ", action.id);
				callback(new Error("INVALID_THREADER_PARAMS"));
			} else callback();
		}, "appLevelValidation");

		core.on('text', function(message, cb) {
			var callback = colors(message, cb);
			var room = message.room;
			if (client.writable && (!room.params || !room.params.threader || room.params.threader.enabled)) {//if client connected
				var threadId = message.threads && message.threads[0] ? message.threads[0].id : undefined;
				var msg = JSON.stringify({
					id: message.id, time: message.time, author: message.from.replace(/guest-/g, ""),
					text: message.text,
					room: message.to,
					threadId: threadId
				});
				log("Sending msg to scrollback.jar= " + msg);
				try {
					client.write(msg + ",");
				} catch(err) {
					log("--error --"+err);
					callback();
					return;
				}
				pendingCallbacks[message.id] = { message: message, fn: callback ,time:new Date().getTime()};
				setTimeout(function() {
					if (pendingCallbacks[message.id]) {
						var fn = pendingCallbacks[message.id].fn;
						delete pendingCallbacks[message.id];
						message.threads = [ { id: "new" } ]; // Make it a new thread if no reply.
						log("pending callback removed after 1 sec for message.id" + message.id);
						fn();
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
	var i;
	try {
		log("data=-:" + data + ":-");
		data = JSON.parse(data);
		log("Data returned by scrollback.jar = "+data.threadId, (pendingCallbacks[data.id] && pendingCallbacks[data.id].message));
		var id = data.threadId;
		//var title = data.title;
		var message = pendingCallbacks[data.id] && pendingCallbacks[data.id].message;
		if (message) {
			var update = false;
			for (i = 0; i < message.threads.length; i++) {
				var th = message.threads[i];
				if (th.id === id) {
					update = true;
				}
				if (th.id === "new") {
					message.threads.splice(i, 1);
					i--;
				}
			}
			if (!update) {
				message.threads.push({id: id, score: 1});
			}
			if (data.spamIndex) {
				for (var index in data.spamIndex) {
					if (data.spamIndex.hasOwnProperty(index)) {
						var a = data.spamIndex[index];
						if (typeof a === 'string') {
							a = parseFloat(a);
						}
						message.labels[index] = a;
					}
				}
			}

			pendingCallbacks[data.id].fn();
			log("called back in ", new Date().getTime() - pendingCallbacks[data.id].time);
			delete pendingCallbacks[data.id];
		}
	} catch(err) {
		log("error on parsing data=" + err);
		return;
	}
}


function init(){
	log("Trying to connect.... ");
	client = net.connect({port: config.port, host: config.host},
		function() { //'connect' listener
		log('client connected');
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

	client.on('error', function(error) {
		log("Error: ", error);
		setTimeout(function() {
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

