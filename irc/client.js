var net = require('net');
var log = require('../lib/logger.js');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var ObjectReader = require('../lib/ObjectReader.js');
var or = new ObjectReader(eventEmitter);
var log = require("../lib/logger.js");
var config = require('../config.js');
var core;
var port = config.irc.port;
var server = config.irc.server;
var client;
var connected = false;
/**
 *@param coreObj event emitter.
 */
module.exports.init = function(coreObj) {
	core = coreObj;
	init();
	eventEmitter.on('object', function(obj) {
		core.emit(obj.type, obj);
	});
	core.on('write', function(obj) {
		writeObject(obj);
	});
};

module.exports.connected = function() {
	return client && connected;
}
function init() {
	client = net.connect({port: port, host: server},
		function() { //'connect' listener
		log('client connected');
		connected = true;
	});
	client.on("data", function(data){
		or.addData(data);	
	});
	client.on('error', function(error){
		log("Can not connect to ircClient process", error);
	});
	client.on('end', function() {
		log('connection terminated');
		connected = false;
		setTimeout(function(){
			init();	
		},1000*60);//try to reconnect after 1 min
	});
}


function writeObject(obj) {
	var v = JSON.stringify(obj);
	var r = v.length + " ";
	r += v;
	client.write(r);	
}





