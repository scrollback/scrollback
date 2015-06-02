var net = require('net');
var log = require('../lib/logger.js');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var ObjectReader = require('../lib/object-reader.js');
var or = new ObjectReader(eventEmitter);
var log = require("../lib/logger.js");
var config;
var core;
var port, server;
var client;
var connected = false;
var reconnectTime = 1000 * 60;
/**
 *@param coreObj event emitter.
 */

module.exports = function(c, conf) {
	core = c;
	config = conf;
	port = config.port;
	server = config.server;
	return {
		init: init,
		connected: isConnected,
	};
};

function init() {
	connect();
	eventEmitter.on('object', function(obj) {
		core.emit(obj.type, obj);
	});
	core.on('write', function(obj) {
		writeObject(obj);
	});
}

function isConnected() {
	return connected;
}


function connect() {
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
		connected = false;
		setTimeout(function(){
			connect();
		}, reconnectTime);
	});
	client.on('end', function() {
		log('connection terminated');
		connected = false;
		setTimeout(function(){
			connect();
		}, reconnectTime);
	});
}

function writeObject(obj) {
	var v = JSON.stringify(obj);
	var r = v.length + " ";
	r += v;
	if(connected) client.write(r);
}





