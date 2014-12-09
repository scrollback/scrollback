var core, config;
var fs = require('fs');
var sitemapHtml;
module.exports = function(coreObject, conf) {
	config = conf;
	init();
	core = coreObject;
	core.on("http/init", function(payload, callback) {
		payload.push({
			get: {
				"/r/sitemap": genSitemap,
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
	res.type('text/plain');
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
		if (!err) res.end(data);
		else next();
	});
}
