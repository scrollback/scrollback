var express = require("./express.js"),
	socket = require("./socket.js"),
	page=require("./page.js");
	app = express.init();

exports.send = socket.send;
exports.init = function() {
	socket.init(app.http);
	if(app.https) socket.init(app.https);
	page.init(app);
};

