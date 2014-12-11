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
var merge = require("./merge-config.js");
var fs = require("fs");
var host = "local.scrollback.io";

var config = {};
var defaults = {
	global: {
		host: host
	},
	core: {
		name: "scrollback",
		newrelic: {
			name: 'Scrollback Local'
		}
	},
	appPriorities: {
		antiflood: 1000,
		validation: 900,
		loader: 850,
		sudo: 825,
		appLevelValidation: 812,
		authentication: 800,
		authorization: 700,
		antiabuse: 600,
		modifier: 500,
		gateway: 400,
		cache: 300,
		storage: 200,
		watcher: 100
	},
	analytics: {
		pg: { //post gre config
			server: "localhost", //server:port
			db: "logs",
			username: "username",
			password: "password"
			//port:
		},
	},
	"browserid-auth": {
		audience: host
	},
	env: "production",
	mysql: {
		host: 'localhost',
		user: 'scrollback',
		password: 'scrollback',
		connectionLimit: 100,
		//debug    :true         ,
		database: 'scrollback'
	},
	http: {
		host: host,
		cookieDomain: ".scrollback.io",
		port: 80,
		home: "public", // the directory containing static files
		time: 60000,
		limit: 30,
		index: "/me" //index URL redirect
	},
	email: {
		from: "scrollback@scrollback.io",
		redisDB: 7
	},
	"redis-storage": {
		host: "local.scrollback.io",
		port: 6379,
		db: 0,
		session: 8,
		user: 9,
		room: 9,
		occupants: 10
	},
	entityloader: {
		nickRetries: 100
	},
	threader: {
		host: "local.scrollback.io",
		port: 12345,
		redisDB: 11
	},
	twitter: {
		//consumerKey: ".."
		//consumerSecret: ".."
		timeout: 1000 * 60,
		silentTimeout: 1000 * 60 * 10,
		redisDB: 6,
	},
	irc: {
		port: 8910,
		server: "localhost"
	},
	"leveldb-storage": {
		path: "/data"
	},
	recommendation:{
		redisDB: 13
	},
	search:{
		redisDB: 14
	},
	sitemap: {
		redisDB: 12
	},
	su: {

	},
	facebook: {
	},
	google: {
	}
};

config = (function() {
	var changes = {};
	if (fs.existsSync("./server-config.js")) {
		changes = require("./server-config.js");
	}
	return merge(defaults, changes);
}());


module.exports = config;