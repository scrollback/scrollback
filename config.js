/*
	Scrollback: Beautiful text chat for your community.
	Copyright (c) 2014 Askabt Pte. Ltd.

This program is free software: you can redistribute it and/or modify it
under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or any
later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see http://www.gnu.org/licenses/agpl.txt
or write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330,
Boston, MA 02111-1307 USA.
*/

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
				// d[i] = d[i].concat(c[i]);
				/*Concatinating the plugins array from the default ones and the ones in
				myConfig is probably not something that we might be interested in.*/
				d[i] = c[i];
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
		name: "scrollback",
		newrelic: { name: 'Scrollback Local' }
	},
	env: "production",
	mysql: {
		host     : 'localhost',
		user     : 'scrollback',
		password : 'scrollback',
		connectionLimit: 100,
		//debug    :true         ,
		database : 'scrollback'
	},
	pg: {//post gre config
		server: "localhost",//server:port
		db: "logs",
		username: "username",
		password: "password"
		//port:
	},
	http: {
		host: "local.scrollback.io",
		cookieDomain: ".scrollback.io",
		port: 80,
		home: "public", // the directory containing static files
		time: 60000,
		limit: 30,
		index: "/me"//index URL redirect
	},
	email: {
		from: "scrollback@scrollback.io"
	},
	auth: {
		audience: "local.scrollback.io"
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
	twitter: {
		//consumerKey: ".."
		//consumerSecret: ".."
		timeout: 1000 * 60,
		silentTimeout: 1000 * 60 * 10
	},
	irc: {
		port: 8910,
		server: "localhost"
	},
	leveldb: {
		path: "/data"
	},
	redisDB:{
		twitter: 6,
		email: 7,
		session: 8,
		user: 9,
		room: 9,
		occupants: 10,
		sitemap: 12,
		recommendation: 13,
		search: 14
	},
	su: {

	},
	facebook: {
	}
};


merge(defaults, changes);
module.exports = defaults;
