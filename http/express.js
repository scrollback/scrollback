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

var express = require("express"),
	http = require("http"), https = require("https"),
	fs = require("fs"),
	config = require("../config.js"),
	session = require("./session.js");

exports.init = function() {
	var app = express(), srv, srvs;

	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', { debug: true });

	/**
	* We need to serve the correct mimetype for the manifest.appcache file.
	* Even though latest browsers don't require this, older versions of browsers do.
	* Also, we need to make sure that the manifest.appcache is not cached.
	*/
	app.use(function(req, res, next) {
		if((req.url).match(/.*\.appcache$/)) {
			res.header('Content-Type', 'text/cache-manifest');
			res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
			res.header('Expires', '0');
			res.header('Pragma', 'no-cache');
		}

		next();
	});

	app.use(express.logger("AA/HTTP - [:date] :method :url :referrer :user-agent :status"));
	app.use(express.compress());
	app.use(express["static"](__dirname + "/../" + config.http.home, { maxAge: 86400000 }));

	app.use(express.cookieParser());
	// app.use(session.parser);
	app.use(express.query());
	app.use(express.bodyParser());

	srv = http.createServer(app);

	srv.listen(config.http.port);
	app.httpServer = srv;

	if (config.http.https) {
		srvs = https.createServer({
			key: fs.readFileSync(__dirname + "/../" + config.http.https.key),
			cert: fs.readFileSync(__dirname + "/../" + config.http.https.cert),
			ca : !config.http.https.ca || fs.readFileSync(__dirname + "/../" + config.http.https.ca)
		}, app);
		srvs.listen(config.http.https.port);
		app.httpsServer = srvs;
	}

	return app;
};

