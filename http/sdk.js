var config = require('./config.js');
var fs = require("fs");
var wh = require("./warehouse.js");

var res = require("./lib/respond.js"),
	log = require("./lib/logger.js").tag('AA/AP'),
	success = res.success, failure = res.failure;




function getContext(req) {
	return {
		webhost: config.webhost,
		user: req.session.user,
		account: req.session.account,
		participations: []
	};
}

var code = fs.readFileSync(__dirname + "/www/js/client.js");

exports.init = function(app) {
	app.get('/context.js', function(req, res, next) {
		var str = "var context = " + JSON.stringify(getContext(req)) + ";";
		res.writeHead(200, {
			"Content-Type": "application/javascript",
			"Content-Length": str.length
		});
		res.end(str);
//		if(next) next();
	});
	
	
	app.get('/1.js', function(req, res, next) {
		if(!wh.validateKey(req)) {
			failure(req, res)('Invalid API key or not a legitimate request');
			return;
		}
		
		var str="(function(){var askabt_key='"+req.query.key+"',"+
			"context=" + JSON.stringify(getContext(req)) + ";"+
			code+"})();";
		res.writeHead(200, {
			"Content-Type": "application/javascript; charset=utf-8",
			"Content-Length": Buffer.byteLength(str, "utf8")
		});
		
		console.log(str.length);
		res.write(str);
		
		res.end("");
	});
};

