var config = require('../config.js');
var log = require("../lib/logger.js");
//var redis = require('../lib/redisProxy.js').select(config.redisDB.sitemap);
var core;
var fs = require('fs');
var sitemapHtml;
module.exports = function(coreObject) {
	init();
	core = coreObject;
	core.on("http/init", function(payload, callback) {
		payload.sitemap = {
			get: function(req, res, next) {
				genSitemap(req, res, next);
			}
		}
		callback(null, payload);
	}, "setters");
	
	
};

function init() {
	sitemapHtml = fs.readFileSync(__dirname + "/sitemap.html");
}

function genSitemap(req, res, next) {
	var path = req.path.substring(11);// "/r/sitemap/"
	var ps = path.split('/');
	console.log("Sitemap request");
	if (ps.length > 0) {
		if (ps[0] === "sitemap.html") res.end(sitemapHtml);
		else if (ps[0] === "featured-rooms.html") {
			fs.readFile(__dirname + "/featured-rooms.html", "utf8", function(err, data) {
				if (!err) res.end(data);
				else next();
			});
		} else next();
	} else {
		next();
	}
}
