var fs = require('fs');
var changes = {};

if (fs.existsSync('./myConfig.js')) {
	changes = require("./myConfig.js");
}
/**
 *It merge c into d
 *@param {object} d default Object
 *@param {object} c this object will be merged into d. 
 */
function merge(d, c) {
	for(var i in c) {
		if (typeof d[i] === 'object' && typeof c[i] === 'object' && d[i] !== null && c[i] !== null) {
			if (d[i] instanceof Array && c[i] instanceof Array) {
				d[i] = d[i].concat(c[i]);
			} else {
				merge(d[i], c[i]);
			}
		} else {
			d[i] = c[i];	
		}
	}
}

var defaults = {
	core: {
		name: "scrollback"
	},
	mysql: {
		host     : 'localhost',
		user     : 'scrollback',
		password : 'scrollback',
		//debug    :true         ,
		database : 'scrollback' 
	},
	http: {
		host: "local.scrollback.io",
		cookieDomain: ".scrollback.io",
		port: 80,
		home: "public", // the directory containing static files
		time: 60000,
		limit: 30
	},
	redis:{
		host: "local.scrollback.io",
		port: 6379,
		db:0
	},
	threader: {
		host : "local.scrollback.io",
		port : 12345
	},
	irc: {
		nick: 'sbtestbot',		// nickname of the bot
		hangTime: 60000     // timeout before disconnecting (ms)
	}
}


merge(defaults, changes);
module.exports = defaults;
