var fs = require('fs');
var log = require('../lib/logger.js');
var events = require('events');
var event = new events.EventEmitter();
var q = [];
var or = new require('../lib/object-reader.js')(event);
var timestamp = new Date().getTime();
var fn = "ircClient/Data/queue" + timestamp + ".txt";
deleteFolder("ircClient/Data");
if(!fs.existsSync("ircClient/Data")) fs.mkdirSync("ircClient/Data");
fs.openSync(fn, "w");
var ff = fs.openSync(fn, "r+");
var writeIndex = 0;
var readIndex  = 0;
event.on("object", function(obj) {
	log("Objects:", obj);
	q.push(obj);
});
module.exports.push = function(obj) {
	var d = writeObject(obj);
	log("Object :", d);
	var buffer = new Buffer(d);
	console.log("buffer", buffer.length);
	var nb = fs.writeSync(ff, buffer, 0, buffer.length, writeIndex);
	console.log("bytes written :", nb);
	writeIndex += buffer.length;
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
			or.addData(new Buffer(bCopy));
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
	return r;
}



function deleteFolder (path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
