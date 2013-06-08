function start(name) {
	var gateway = require("../gate/"+name+"/"+name+".js");
	gateway.init();
	return gateway;
}

exports.irc = start("irc");
exports.http = start("http");

