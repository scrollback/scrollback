var net = require('net');
var events = require('events');
var core = new events.EventEmitter();
var ObjectReader = require('../lib/ObjectReader.js');
var gen = require("../lib/generate.js");
var guid = gen.uid;
var or= new ObjectReader(core);

console.log("Trying to connect.... ");
client = net.connect({port: 78910, host: "localhost"},
	function() { //'connect' listener
	console.log('client connected');
});

var uid = guid();

writeObject({
	uid: uid,
	type: 'connectBot',
	botNick: "testingBot",
	room: {
		id: "scrollback",
		params: {
			irc: {
				server: "localhost",
				channel: "#scrollback",
				pending: false,
				enable: true
			}
		}
	},
	options: {}
});
writeObject({
	uid: uid,
	type: 'connectBot',
	botNick: "testingBot",
	room: {
		id: "testingRoom",
		params: {
			irc: {
				server: "localhost",
				channel: "#testingRoom",
				pending: true,
				enable: true
			}
		}
	},
	options: {}
});

core.on('object', function(obj) {
	console.log("object: ", obj);
	if (obj.type === "room") {
		setTimeout(function() {
			writeObject({
				uid: 'uid1',
				type: 'connectUser',
				roomId: "scrollback",
				nick: "kamal",
				options: {}
			});
		}, 2000);
		writeObject({
			uid: 'uid11',
			type: 'connectUser',
			roomId: "scrollback",
			nick: "test123",
			options: {}
		});
		setTimeout(function() {
			writeObject({
				uid: 'uid3',
				type: 'say',
				message : {
					from: "test123",
					to: "scrollback",
					text: "this is message from kamal"
				}
			});
		}, 8000);
		setTimeout(function() {
			writeObject({
				uid: 'uid4',
				type: 'partBot',
				roomId: "scrollback"
			});
		}, 20000);
	}
});


client.on("data", function(data){
	or.addData(data);
});

client.on('error', function(error){
	
});
client.on('end', function() {
});


function writeObject(obj) {
	var v = JSON.stringify(obj);
	var r = v.length + " ";
	r += v;
	client.write(r);	
}


