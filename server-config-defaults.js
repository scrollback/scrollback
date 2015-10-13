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

"use strict";

var merge = require("./merge-config.js");
var fs = require("fs");

var config = {};

var defaults = {
	plugins:  [ "validator", "browserid-auth", "facebook", "featured", "anti-abuse",
				"threader", "thread-color", "notability", "authorizer", "redis-storage", "storage",
				"entityloader", "irc", "twitter", "jws", "censor", "email", "superuser", "sitemap",
				"push-notification", "google", "upload" ],
	global: {
		host: "localhost",
		su: {}
	},
	core: {
		name: "scrollback",
		newrelic: {
			name: 'Scrollback Local'
		}
	},
	"browserid-auth": {
		audience: "http://localhost:7528"
	},
	env: "development",
	http: {
		host: "localhost",
		cookieDomain: "localhost",
		port: 7528,
		home: "public", // the directory containing static files
		time: 60000,
		limit: 30,
		index: "/me" //index URL redirect
	},
	email: {
		welcomeEmailSub: "Welcome to Scrollback",
		from: "scrollback@scrollback.io",
		redisDB: 7
	},
	"redis-storage": {
		host: "localhost",
		port: 6379,
		sessionDB: 8,
		userDB: 9,
		roomDB: 9,
		occupantsDB: 10
	},
	entityloader: {
		nickRetries: 100
	},
	threader: {
		host: "localhost",
		port: 55555,
		redisDB: 11
	},
	"thread-color": {
		redisDB: 11, // no harm in reusing as long as there is no key collision
		numColors: 10
	},
	twitter: {
		//consumerKey: ".."
		//consumerSecret: ".."
		timeout: 1000 * 60 * 5,
		silentTimeout: 1000 * 60 * 10,
		redisDB: 6
	},
	irc: {
		port: 8910,
		server: "localhost"
	},
	"leveldb-storage": {
		path: "/data",
		disableQueries: true
	},
	featured:{
		redisDB: 13
	},
	search:{
		redisDB: 14
	},
	sitemap: {
		redisDB: 12
	},
	facebook: {
	},
	google: {
	},
	storage: {
		pg: {
			server: "localhost", //server:port
			db: "scrollback",
			username: "scrollback",
			password: "scrollback"
		},
		redisDB: 5
	},
	upload: {
		accessKey: "",
		secretKey: "",
		region: "",
		bucket: "",
		acl: "public-read",
		service: "s3",
		signatureVersion: "aws4_request",
		algorithm: "AWS4-HMAC-SHA256"
	},
	jws: {
		keys: {
			"localhost:7528": ["XGuySQ0dH5Dt+5pc7sDwSrG3Qx679h57h9dt6GAiNGh0MyOJuuaAnXTym6duXJYVeqyuV2D/hXLzwVZHr/UyDXJDClIRk5wSeyqfX9keiTI6OZzZ0flK8Gd9/hX4sSZYsd9eKK5LGfzJxki95r46W7Y626aq/Ii3sZgIk9WCZMg="]
		}
	}
};

config = (function() {
	var changes = {};
	if (fs.existsSync(__dirname + "/server-config.js")) {
		changes = require("./server-config.js");
	}
	return merge(defaults, changes);
}());

module.exports = config;
