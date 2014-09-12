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
		payload.push({
			get: {
				"/r/sitemap.html": genSitemap,
				"/robots.txt": genRobots,
				"/r/featured-rooms": genFeaturedRoom
			}
		});
		callback(null, payload);
	}, 1000);
	
	
};

function init() {
	sitemapHtml = fs.readFileSync(__dirname + "/views/sitemap.html");
}

function genRobots(req, res, next) {
	fs.readFile(__dirname + "/views/robots.txt", "utf8", function(err, data) {
		if (!err && data) {
			res.end(data);
		} else next();
	});
}


function genSitemap(req, res/*, next*/) {
	res.end(sitemapHtml);
}


function genFeaturedRoom(req, res, next) {
	fs.readFile(__dirname + "/views/featured-rooms.html", "utf8", function(err, data) {
		console.log(err, "data", data);
		if (!err) res.end(data);
		else next();
	});
}
