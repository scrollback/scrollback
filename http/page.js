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

var core, config,
	clientData = require('../client-config-defaults.js'),
	fs = require("fs"),
	core,
	handlebars = require("handlebars"),
	seo, clientTemp, clientHbs, oldAppHTML,
	log = require('../lib/logger.js');

module.exports = function(c, conf) {
	core = c;
	config = conf;

	return {
		init: init
	};
};

function init (app) {
	if (!config.https) {
		log.w("Insecure connection. Specify https options in your config file.");
	}

	start();

	app.get('/t/*', function(req, res, next) {
		fs.readFile(__dirname + "/../public/s/preview.html", "utf8", function(err, data) {
			res.end(data);
			next();
		});
	});

	app.get("/", function(req, res) {
		res.redirect(307, config.index);
	});

	app.get("/*", function(req, res, next) {
		if (/^\/t\//.test(req.path)) {
			return next();
		}

		if (/^\/s\//.test(req.path)) {
			return next();
		}

		if (!req.secure && config.https) {
			var queryString = req._parsedUrl.search ? req._parsedUrl.search : "";
			return res.redirect(301, 'https://' + config.host + req.path + queryString);
		}

		var platform = req.query.platform;
		
		clientData.appVersion = req.query["app-version"] || "defaults";
		clientData.manifest = (platform ? platform.toLowerCase() : "manifest") + ".appcache";
		clientData.cordova = (!!(platform && (/cordova/i).test(platform))) ||
			(platform === "android"); // fixing backward compatibitly issue
		
		if(clientData.cordova) return serverStaticFile(res);
		seo.getSEOHtml(req, function(r) {
			clientData.seo = r;
			res.end(clientTemp(clientData));
		});

	});
}
function serverStaticFile(res) {
	res.end(oldAppHTML);
}
function start() {
	oldAppHTML = fs.readFileSync(__dirname + "/old-app-page.html");
	clientHbs = fs.readFileSync(__dirname + "/../public/app.hbs", "utf8");
	seo = require('./seo.js')(core, config);
	clientTemp = handlebars.compile(clientHbs);
}
