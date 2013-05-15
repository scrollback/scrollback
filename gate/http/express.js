var express = require("express"),
	http = require("http"),
	config = require("../../config.js"),

	session = require("./session.js"),
	api = require("./api.js"),
	wdg = require("./wdg.js"),
	sdk = require("./sdk.js"),
	page = require("./page.js");
	printer = require("./dataview.js");

exports.init = function() {
	var app = express(), srv,
		landing = fs.readFileSync(config.web.home);
	
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', { debug: true });
	
	app.use(express.logger("AA/HTTP - [:date] :method :url :referrer :user-agent :status"));
	app.use(express.cookieParser());
	app.use(session.parser);

	api.init(app, "/api1");
	wdg.init(app, "/wdg1");
	printer.init(app, "/printer");
	
	app.get('/', function(req, res) {
		res.write(landing)
	});
	
	app.use(express["static"](__dirname + "/www"));
	
	srv = http.createServer(app);
	srv.listen(config.web.port);
	
	app.server = srv;
	return app;
}

