var express = require("./express"),
	socket = require("./socket.js"),
	app = express.init();

socket.init(app.server);
exports.post = socket.post;