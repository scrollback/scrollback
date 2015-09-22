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

var core, config,
	fs = require("fs"),
	handlebars = require("handlebars"),
	clientConfig = require("../client-config-defaults.js"),
	clientTemplate = handlebars.compile(fs.readFileSync(__dirname + "/../public/app.hbs", "utf8")),
	log = require("../lib/logger.js"),
	seo, handleRequestInfo;

function start() {
	seo = require("./seo.js")(core, config);
	handleRequestInfo = require("./handle-request-info.js")(core, config);
}

function init(app) {
	if (!config.https) {
		log.w("Insecure connection. Specify https options in your config file.");
	}

	start();

	app.get("/t/*", function(req, res, next) {
		fs.readFile(__dirname + "/../public/s/preview.html", "utf8", function(err, data) {
			res.end(data);

			next();
		});
	});

	app.get("/", function(req, res) {
		res.redirect(307, config.index);
	});

	app.get("/*", function(req, res, next) {
		if (/^\/t\//.test(req.path) || /^\/s\//.test(req.path) || /^\/favicon\.ico$/.test(req.path)) {
			return next();
		}

		if(/^\/r\//.test(req.path)) return next();
		if (/^\/i\//.test(req.path)) {
			try {
				handleRequestInfo(req, function(err, data) {
					if (err || !data) {
						log.e("Error retriving info for", req.path, err);

						res.send(404);

						return;
					}

					if (data.type === "url" && data.url) {
						res.redirect(302, data.url);
					} else if (data.type === "json" && data.json) {
						res.setHeader("Content-Type", "application/json");
						res.end(data.json);
					} else {
						log.e("Got invalid data for", req.path, ":", data, err);

						res.send(404);
					}
				});
			} catch(err) {
				log.e("Error handling query for", req.path, err);

				res.send(404);
			}

			return next();
		}

		if (!req.secure && config.https) {
			return res.redirect(301, "https://" + req.get("host") + req.originalUrl);
		}

		seo.getSEO(req, function(r) {
			clientConfig.seo = r;

			res.end(clientTemplate(clientConfig));
		});
	});
}

module.exports = function(c, conf) {
	core = c;
	config = conf;

	return { init: init };
};
