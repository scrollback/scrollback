var express = require("express"),
	http = require("http"),
	config = require("../../config.js"),
	session = require("./session.js");

exports.init = function() {
	var app = express(), srv;

	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', { debug: true });
	
//	app.use(express.logger("AA/HTTP - [:date] :method :url :referrer :user-agent :status"));
	app.use(express.cookieParser());
	app.use(session.parser);
	
	app.use(express["static"](__dirname + "/../../" + config.http.home));
	
	srv = http.createServer(app);
	srv.listen(config.http.port);
	
	app.server = srv;
	return app;
}

