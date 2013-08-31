var express = require("express"),
	http = require("http"),
	https = require("https"),
	fs = require("fs"),
	config = require("../../config.js"),
	session = require("./session.js");

exports.init = function() {
	var app = express(), srv, srvs;

	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', { debug: true });
	
	app.use(express.logger(
		"AA/HTTP - [:date] :method :url :referrer :user-agent :status"));
	app.use(express.cookieParser());
	app.use(session.parser);
	app.use(express.query());
	
	app.use(express["static"](__dirname + "/../../" + config.http.home));
	
	srv = http.createServer(app);
	srv.listen(config.http.port);
	
	srvs = https.createServer({
		key: fs.readFileSync(__dirname + "/../../" + config.http.https.key),
		cert: fs.readFileSync(__dirname + "/../../" + config.http.https.cert)
	}, app);
	srvs.listen(config.http.https.port);
	
	app.http = srv;
	app.https = srvs;
	return app;
}

