/*
	Scrollback: Where communities hangout.
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

var plugins = [ "validator", "browserid-auth", "facebook", "featured", "anti-abuse",
				"threader", "thread-color", "notability", "authorizer", "redis-storage", "storage",
				"entityloader", "irc", "twitter", "jws", "censor", "email", "superuser", "sitemap",
				"push-notification", "google", "upload" ],
	appPriorities = { // don't override
		antiflood: 1000,
		validation: 900,
		loader: 850,
		sudo: 825,
		appLevelValidation: 812,
		authentication: 800,
		authorization: 700,
		antiabuse: 600,
		setters: 510,
		modifier: 500,
		cache: 400,
		storage: 300,
		gateway: 200,
		watcher: 100
	};

require("newrelic");

var log = require("./lib/logger.js"),
	config = require("./server-config-defaults.js"),
	core = new (require("ebus"))(appPriorities);

log.setEmailConfig(config.email);

process.title = config.core.name;
process.env.NODE_ENV = config.env;

log.w("Running in \"" + process.env.NODE_ENV + "\" environment");

function start(name) {
	var plugin = require("./" + name + "/" + name + ".js");

	config[name] = config[name] || {};
	config[name].global = config.global;

	log.i("Starting ", name);

	plugin(core, config[name]);
}

plugins.forEach(start);

if (process.env.NODE_ENV !== "production") {
	start("testauth");
}

start("http"); // start http app at last

// core.setDebug(true);
