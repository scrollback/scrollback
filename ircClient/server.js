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
			ircClient.connectBot(obj.room, obj.botNick, obj.server, obj.channel, obj.options, function() {
				writeObject({type: 'callback', uid : obj.uid});
			});
			break;
		case 'connectUser':
			ircClient.connectUser(obj.room, obj.nick, obj.server, obj.channels, obj.options, function() {
				writeObject({type: 'callback', uid: obj.uid});
			});
			break;
		case 'part':
			ircClient.part(obj.server, obj.channel);
			break;
		case 'partUser':
			ircClient.partUser(obj.server, obj.nick, obj.channel);
			break;
		case 'say':
			ircClient.say(obj.server, obj.nick, obj.channel, obj.message);
			break;
		case 'rename':
			ircClient.rename(obj.server, obj.oldNick, obj.newNick, function(newNick) {
				writeObject({type: 'callback', uid: obj.uid, newNick: newNick});
			});
			break;
		case 'whois':
			ircClient.whois(obj.server, obj.nick,function(info) {
				writeObject({type: 'callback', uid: obj.uid, info: info});
			});
			break;
		case 'sendRawMessage':
			ircClient.sendRawMessage(obj.server, obj.nick, obj.message);
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
