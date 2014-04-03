var net = require('net');
var events = require('events');
var core = new events.EventEmitter();
var or = require('./objectReader.js');
or.init(core);

console.log("Trying to connect.... ");
client = net.connect({port: 78910, host: "localhost"},
	function() { //'connect' listener
	console.log('client connected');
});

client.on("data", function(data){
	or.addData(data);
	
});

core.on('object', function(object) {
	console.log("object: ", object);	
});

client.on('error', function(error){
	
});
client.on('end', function() {
});



