var net = require('net');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var ObjectReader = require('../lib/ObjectReader.js');
var or = new ObjectReader(eventEmitter);
var log = require("../lib/logger.js");
var core;
var port = 78910;
var server = "localhost";
/**
 *@param coreObj event emitter.
 */
module.exports = function(coreObj) {
	core = coreObj;
	eventEmitter.on('object', function(obj) {
		core.emit(obj.type, obj);
	});
	core.on('write', function(obj) {
		writeObject(obj);
	});
	client = net.connect({port: port, host: server},
		function() { //'connect' listener
		log('client connected');
	});
	client.on("data", function(data){
		or.addData(data);	
	});
	
	client.on('error', function(error){
		//TODO handle error and end events.
		
	});
	
	client.on('end', function() {
		//TODO handle end event
		
	});
};


function writeObject(obj) {
	var v = JSON.stringify(obj);
	var r = v.length + " ";
	r += v;
	client.write(r);	
}





