var express = require("./express.js"),
	socket = require("./socket.js"),
	log = require("../lib/logger.js"),
	page=require("./page.js");
	app = express.init();


var init = function() {
	socket.init(app.http);
	if(app.https) socket.init(app.https);
	page.init(app);
};

module.exports = function(core){
	init();
	core.on("message" , function(message, callback) {
		log("Listening");
		if(typeof message.to == "string")
			send(message, [message.to]);
		else if(typeof message.to == "object")
			send(message, message.to);
		callback();
	}, "gateway");
	var send = socket.send;
}