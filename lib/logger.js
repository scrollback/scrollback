"use strict";

var util = require("util"),
	fs = require("fs");

function line(args) {
	return [
		(new Date()).toISOString().replace(/.*T/, '').replace(/\.\w*$/, ''),
		(new Error()).stack.
		replace(/.*(Error|node_modules|logger|native).*\n/g, ''). // remove lines with these words
		replace(/\n[\s\S]*$/, '').  // take the first line
		replace(/^[\s\S]*?\/scrollback.*\//, '').      // relative path
		replace(/^.*\s*at\s*/, '').
		replace(/[\)\(]/g, ''),
		util.format.apply(util, args).replace(/\s+/g, ' ')
	].join(' ');
}

var log = function () {
	console.log(line(arguments));
};

log.tag = function (tag) {
	var ws, nws, queue = [], bytes=0, opening = false,
		dir = require("path").normalize(__dirname + '/../logs/' + tag);
	if(!fs.existsSync(dir)) fs.mkdirSync(dir);
	
	return function() {
		queue.push(line(arguments));
		if(ws) write(); else if(!opening) open();
	};
	
	function open() {
		if(ws) { ws.end(); ws = null; }
		opening = true;
		var time = (new Date()).toISOString().replace(/[T:]/g, '-').replace(/\.\w*$/, ''),
			nws = fs.createWriteStream(dir + '/' + time + '.log').on('open', function() {
				opening = false;
				ws = nws;
				bytes = 0;
				write();
			});
	}
	
	function write() {
		if(!queue.length) return;
		var l = queue.join('\n') + '\n';
		bytes += l.length;
		ws.write(l);
		queue = [];
		if(bytes > 1024*1024*128) open();
	}
};

module.exports = log;