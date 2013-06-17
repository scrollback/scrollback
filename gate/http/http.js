var express = require("./express.js"),
	socket = require("./socket.js"),
	page=require("./page.js");
	app = express.init();

exports.send = socket.send;
exports.init = function() {
	socket.init(app.server);
	page.init(app);
};
