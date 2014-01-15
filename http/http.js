var express = require("./express.js"),
	socket = require("./socket.js"),
	log = require("../lib/logger.js"),
	page=require("./page.js");
	app = express.init();

var init = function(core) {
	socket.init(app.httpServer, core);
	if(app.httpsServer) socket.init(app.httpsServer, core);
	page.init(app, core);
};

module.exports = function(core){
	init(core);
	core.on("message" , function(message, callback) {
		log("Heard \"message\" Event");
		if(typeof message.to == "string")
			send(message, [message.to]);
		else if(typeof message.to == "object")
			send(message, message.to);
		callback();
	}, "gateway");
	var send = socket.send;
}