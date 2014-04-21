var ircClient = require('./ircClient.js');
var net = require('net');
var events = require('events');
var core = new events.EventEmitter();
var ObjectReader = require('../lib/ObjectReader.js');
var or = new ObjectReader(core);
var dataQueue = require("./queue.js");
var port = 78910;
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
		state: lastDisconnectData
	}, true);
	
	c.on('data', function(data) { 
		handleIncomingData(data);	
	});
	c.on('end', function() {
		lastDisconnectData = clone(ircClient.getCurrentState());
		
		isConnected = false;
		console.log('client disconnected copied data', lastDisconnectData);
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
			while(dataQueue.length() !== 0) {
				var a = dataQueue.pop();
				//TODO change object based on new scrollback names.
				console.log("writing queue values:", a);
				client.write(a);
			}
			console.log("queue is empty now");
			isConnected = true;
			console.log('server connected');
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
			ircClient.getBotNick(obj.roomId, function(nick){
				writeObject({type: 'callback', uid: obj.uid, data: nick});
			});
	}
	
});


function writeObject(obj, init) {//move this inside objectWriter 
	var v = JSON.stringify(obj);
	var r = v.length + " ";
	r += v;
	if (isConnected || init) {
		console.log("sending :", r);
		client.write(r);
	} else {
		dataQueue.push(r);
	}
}

function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;
    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}
