var ircClient = require('./ircClient.js');
var config = require('./config.js');
var net = require('net');
var events = require('events');
var core = new events.EventEmitter();
var ObjectReader = require('../lib/object-reader.js');
var or = new ObjectReader(core);
var log = require('../lib/logger.js');
var port = config.port;
var client;
var isConnected = false;
process.env.NODE_ENV = config.env;
log.w("Your current Env is " + config.env);
if (config.email.auth) {
	log.setEmailConfig(config.email);
}
core.on('data', function(data) {
	writeObject(data);
});
ircClient.init(core);

var server = net.createServer(function(c) { //'connection' listener
	if (client && isConnected) {
		c.destroy();//disconnect.
		return;//allow only one connection.
	}
	isConnected = true;
	client = c;
	log("new Connection Request");
	writeObject({
		type: "init",
		state: ircClient.getCurrentState()
	});

	c.on('data', function(data) {
		handleIncomingData(data);
	});
	c.on('end', function() {
		log("End Event");
		ircClient.setConnected(false);
		isConnected = false;
	});
	c.on('error', function(err) {
		//TODO handle error conditions properily
		log.e("Error event ", err);
		ircClient.setConnected(false);
		isConnected = false;
	});
});
server.listen(port, function() { //'listening' listener
	log('server bound');
});


function handleIncomingData(data) {
	or.addData(data);//emit object event on each new Object.
}
/**
 *Data from client.
 */
core.on('object', function(obj) {
	var fn = obj.type;
	console.log("received : ", obj);
	switch (fn) {
		case 'init':
			console.log('server connected received init back all users init complete.');
			ircClient.sendQueueData();
			ircClient.setConnected(true);
			break;
		case 'connectBot':
			ircClient.connectBot(obj.room, obj.options || {}, function(msg) {
				writeObject({type: 'callback', uid: obj.uid, data: msg});
			});
			break;
		case 'partBot':
			ircClient.partBot(obj.roomId, function() {
				writeObject({type: 'callback', uid: obj.uid});
			});
			break;
		case 'connectUser':
			ircClient.connectUser(obj.roomId, obj.nick, obj.options || {}, function() {
				writeObject({type: 'callback', uid: obj.uid});
			});
			break;
		case 'say':
			ircClient.say(obj.message);
			break;
		case 'rename':
			ircClient.rename(obj.oldNick, obj.newNick);
			break;
		case 'newNick'://new scrollback nick for IRC nick.
			ircClient.newNick(obj.roomId, obj.nick, obj.sbNick);
			break;
		case 'partUser':
			ircClient.partUser(obj.roomId, obj.nick);
			break;
		case 'getCurrentState':
			var state = ircClient.getCurrentState();
			writeObject({type: 'callback', uid: obj.uid, data: state});
			break;
		case 'getBotNick':
			var nick = ircClient.getBotNick(obj.roomId);
			writeObject({type: 'callback', uid: obj.uid, data: {nick: nick}});
			break;
		case 'isUserConnected':
			var isConn = ircClient.isUserConnected(obj.sbNick);
			writeObject({type: 'callback', uid: obj.uid, data: isConn});
			break;
		case 'disconnectUser':
			ircClient.disconnectUser(obj.sbNick);

	}

});


function writeObject(obj) {//move this inside objectWriter
	var v = JSON.stringify(obj);
	var r = v.length + " ";
	r += v;
	log("sending :", r.substring(0, 50), "length", r.length);
	log.d("Sending :", r);
	client.write(r);
}

