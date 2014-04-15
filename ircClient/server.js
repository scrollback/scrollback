var ircClient = require('./ircClient.js');
var net = require('net');
var events = require('events');
var core = new events.EventEmitter();
var ObjectReader = require('../lib/ObjectReader.js');
var or = new ObjectReader(core);
var port = 78910;
var client;
var dataQueue = [];
var isConnected = false;
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
	while(dataQueue.length !== 0) client.write(dataQueue.pop());
	isConnected = true;
	console.log('server connected');
	c.on('data', function(data) { 
		handleIncomingData(data);	
	});
	c.on('end', function() {
		isConnected = false;
		console.log('server disconnected');
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
		case 'connectBot':
			ircClient.connectBot(obj.room, obj.options, function(msg) {
				writeObject({type: 'callback', uid: obj.uid, data: msg});
			});
			break;
		case 'partBot':
			ircClient.partBot(obj.roomId);
			break;
		case 'connectUser':
			ircClient.connectUser(obj.roomId, obj.nick, obj.options, function() {
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
			ircClient.getCurrentState(function(state) {
				writeObject({type: 'callback', uid: obj.uid, data: state});
			});
			break;
		case 'getBotNick':
			ircClient.getBotNick(obj.roomId, function(nick){
				writeObject({type: 'callback', uid: obj.uid, data: nick});
			});
	}
	
});


function writeObject(obj) {//move this inside objectWriter 
	var v = JSON.stringify(obj);
	var r = v.length + " ";
	r += v;
	if (isConnected) {
		console.log("sending :", r);
		client.write(r);
	} else {
		dataQueue.push(r);
	}
}
