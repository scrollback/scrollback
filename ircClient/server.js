var ircClient = require('./ircClient.js');
var net = require('net');
var events = require('events');
var core = new events.EventEmitter();
var or = require('./objectReader.js');
or.init(core);
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
			ircClient.connectBot(obj.room, obj.botNick, obj.options, function() {
				writeObject({type: 'callback', uid : obj.uid});
			});
			break;
		case 'connectUser':
			ircClient.connectUser(obj.room, obj.nick, obj.options, function() {
				writeObject({type: 'callback', uid: obj.uid});
			});
			break;
		case 'say':
			ircClient.say(obj.message);
			break;
		case 'rename':
			ircClient.rename(obj.oldNick, obj.newNick);
			break;
		case 'whois':
			ircClient.whois(obj.server, obj.nick,function(info) {
				writeObject({type: 'callback', uid: obj.uid, info: info});
			});
			break;
		case 'sendRawMessage':
			ircClient.sendRawMessage(obj.server, obj.nick, obj.message);
			break;
		case 'newNick'://new scrollback nick for IRC nick.
			ircClient.newNick(obj.room, obj.nick, obj.sbNick);
			break;
		case 'partUser':
			console.log("room id", obj.roomId);
			ircClient.partUser(obj.roomId, obj.nick);
			break;
		case 'getCurrentState':
			ircClient.getCurrentState(function(state) {
				writeObject({type: 'callback', uid: obj.uid, state: state});
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
