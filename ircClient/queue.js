var fs = require('fs');
var log = require('../lib/logger.js');
var events = require('events');
var event = new events.EventEmitter();
var q = [];
//TODO use (fixed)Object reader
//TODO path and new file for each restart.
var timestamp = new Date().getTime();
var fn = "ircClient/Data/queue" /*+ timestamp*/ + ".txt";
if(!fs.existsSync("ircClient/Data")) fs.mkdirSync("ircClient/Data");
//fs.writeFileSync(fn);

var ff = fs.openSync(fn, "r+");
var writeIndex = 0;
var readIndex  = 0;
event.on("object", function(obj) {
	log("Objects", obj);
	q.push(obj);
});
module.exports.push = function(obj) {
	var d = writeObject(obj);
	log("Object :", d);
	fs.writeSync(ff, d, writeIndex, "utf8");
	writeIndex += d.length;
	//q.push(obj);
};
module.exports.pop = function() {
	if (q.length === 0) {
		while(true) {
			if (readIndex === writeIndex) break;
			var size = Math.min(writeIndex - readIndex,4096);
			var buffer = new Buffer(size);
			var l = fs.readSync(ff, buffer, 0, size, readIndex);
			readIndex += l;
			
			var bCopy = [];
			for (var i = 0;i < l;i++) {
				bCopy.push(buffer[i]);
			}
			addData(new Buffer(bCopy));
			
			if (q.length !== 0) break;
		}
	}
	if (q.length === 0 ) return null; 
	return q.shift();
};
module.exports.length = function(){
	return q.length;
};

function writeObject(obj) {//move this inside objectWriter 
	var v = JSON.stringify(obj);
	var r = v.length + " ";
	r += v;
	log("sending :", r);
	return r;
}

var pd = "";
var isNumber = true;
var no = -1;

function addData(data) {
	data = data.toString('utf8');
	pd = processData(pd + data);
}

function processData(d) {
	if (isNumber) {
		if (d.indexOf(' ') != -1 ) {
			no = parseInt(d.substring(0, d.indexOf(' ')), 10);
			d = d.substring(d.indexOf(' ') + 1);
			isNumber = false;
		}
	}
	if(!isNumber) {
		if (d.length >= no) {
			event.emit('object', JSON.parse(d.substring(0, no)));
			d = d.substring(no);
			isNumber = true;
			if (d.length > 0) {
				return processData(d);
			}
			
		}
	}
	return d;
}






