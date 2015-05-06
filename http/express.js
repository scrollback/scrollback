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

var express = require("express"),
	http = require("http"),
	https = require("https"),
	fs = require("fs"),
	config;

function init() {
	var app = express(),
		srv, srvs, appcached;

	appcached = fs.readFileSync(__dirname + "/../public/manifest.appcache").toString().split(/\n/).filter(function(u) {
		// Ignore empty lines, comments and headers
        return u.length && !/(^#|^[A-Z]+:$)/.test(u);
    });

	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', { debug: true });

	app.use(function(req, res, next) {
		if (req.url.match(/.*\.appcache$/)) {
			// We need to serve the correct mimetype for the manifest.appcache file.
			// Even though latest browsers don't require this, older versions of browsers do.
			// Firefox doesn't use appcache if we add Cache-Control: no-cache.
			res.header('Content-Type', 'text/cache-manifest');
			res.header('Expires', new Date(Date.now() + 86400000).toUTCString());
			res.header('Pragma', 'no-cache');
		} else if (appcached.indexOf(req.url) > -1) {
			// Firefox doesn't load latest resources if we don't do this.
			res.header('Cache-Control', 'no-cache');
		}

		next();
	});

	app.use(express.logger("AA/HTTP - [:date] :method :url :referrer :user-agent :status"));
	app.use(express.compress());
	app.use(express.static(__dirname + "/../" + config.home, {
		maxAge: 86400000
	}));

	if (process.env.NODE_ENV !== "production") {
		app.use(express.static(__dirname + '/../test/public'));
	}

	app.use(express.cookieParser());
	app.use(express.query());
	app.use(express.bodyParser());

	srv = http.createServer(app);

	srv.listen(config.port);
	app.httpServer = srv;

	if (config.https) {
		srvs = https.createServer({
			key: fs.readFileSync(__dirname + "/../" + config.https.key),
			cert: fs.readFileSync(__dirname + "/../" + config.https.cert),
			ca: !config.https.ca || fs.readFileSync(__dirname + "/../" + config.https.ca)
		}, app);
		srvs.listen(config.https.port);
		app.httpsServer = srvs;
	}

	return app;
}

module.exports = function(core, conf) {
	config = conf;
	return {
		init: init
	};
};
