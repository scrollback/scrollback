var ircClient = require('./ircClient.js');
var config = require('./config.js');
var net = require('net');
var events = require('events');
var core = new events.EventEmitter();
var ObjectReader = require('../lib/ObjectReader.js');
var or = new ObjectReader(core);
var dataQueue = require("./queue.js");
var port = config.port;
var client;

var isConnected = false;
var lastDisconnectData = {rooms: {}, servChanProp: {}, servNick: {}};
core.on('data', function(data) {
	writeObject(data);
});
ircClient.init(core);

var server = net.createServer(function(c) { //'connection' listener
	if (client && client.writable) {
		c.destroy();//disconnect.
		return;//allow only one connection.
	}
	client = c;
	
	console.log("new Connection Request");
	writeObject({
		type: "init",
		state: ircClient.getCurrentState()
	}, true);
	
	c.on('data', function(data) { 
		handleIncomingData(data);	
	});
	c.on('end', function() {
		ircClient.setConnected(false);
		isConnected = false;
	}); 
});
server.listen(port, function() { //'listening' listener
  console.log('server bound');
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
			ircClient.partBot(obj.roomId);
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
	}
	
});


function writeObject(obj) {//move this inside objectWriter 
	var v = JSON.stringify(obj);
	var r = v.length + " ";
	r += v;
	console.log("sending :", r);
	client.write(r);
}

