/*eslint-disable */
"use strict";
/**
It usage process.env.NODE_ENV to show vesbose log.
*/
var winston = require('winston');
var Email = require("./email.js");
var email;
var util = require("util"),
	fs = require("fs");
var emailConfig;
var customLevels = {
	levels: {
		debug: 0,
		info: 1,
		warn: 2,
		error: 3,
	},
	colors: {
		debug: 'blue',
		info: 'green',
		warn: 'yellow',
		error: 'red'
	}
};
var logger = new(winston.Logger)({
	transports: [
		new(winston.transports.Console)({
			level: 'debug',
			levels: customLevels.levels,
			colorize: true
		})
		/*,
				new (winston.transports.File)({ filename: 'logs/log-' + new Date().getTime() +  '.log' })	*/
	]
});

function line(args) {
	return [
		(new Date()).toISOString().replace(/\.\w*$/, '').replace(/^20/, ""),
		(new Error()).stack.
		replace(/.*(Error|node_modules|logger|native).*\n/g, ''). // remove lines with these words
		replace(/\n[\s\S]*$/, ''). // take the first line
		replace(/^[\s\S]*?\/scrollback.*\//, ''). // relative path
		replace(/^.*\s+at\s*/, '').
		replace(/[\)\(]/g, ''),
		util.format.apply(util, args).replace(/\s+/g, ' ')
	].join(' ').substr(0,1024);
}

function isProduction() {
	return process.env.NODE_ENV === "production";
}

var log = function() {
	if (process.env.TRAVIS) {
		return;
	}
	logger.info(line(arguments));
	//console.log(line(arguments));
};

log.i = function() {
	if (process.env.TRAVIS) {
		return;
	}
	logger.info(line(arguments));
};

log.e = function() {
	var l = line(arguments);
	logger.error(l);
	if (email && isProduction() && emailConfig.to) {
		var subject = "Error logs: " + l.substring(0, l.indexOf(" ", l.indexOf(" ") + 1));
		email.send(emailConfig.from, emailConfig.to, subject, line(arguments));
	}
};

log.w = function() {
	logger.warn(line(arguments));
};

log.d = function() {
	//	if(process.env.TRAVIS){
	//		return;
	//	}
	if (!isProduction()) {
		var str = [];
		for (var i = 0, j = arguments.length; i < j; i++) {
			var val = arguments[i];
			try {
				if (typeof val === 'object') str.push(JSON.stringify(val));
				else str.push(val);
			} catch (e) {
				str.push(e.toString());
				str.push(val + "");
			}
		}
		logger.debug(line(str));
	}
};

log.setEmailConfig = function(cnf) {
	emailConfig = cnf;
	email = new Email(emailConfig.auth);
};

log.tag = function(tag) {
	var ws, queue = [],
		bytes = 0,
		opening = false,
		dir = require("path").normalize(__dirname + '/../logs/' + tag);
	if (!fs.existsSync(dir)) fs.mkdirSync(dir);

	return function() {
		queue.push(line(arguments));
		if (ws) write();
		else if (!opening) open();
	};

	function open() {
		if (ws) {
			ws.end();
			ws = null;
		}
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
		if (!queue.length) return;
		var l = queue.join('\n') + '\n';
		bytes += l.length;
		ws.write(l);
		queue = [];
		if (bytes > 1024 * 1024 * 128) open();
	}
};

module.exports = log;
