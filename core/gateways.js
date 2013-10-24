function start(name) {
	var gateway = require("../gate/"+name+"/"+name+".js");
	gateway.init();
	return gateway;
}

process.nextTick(function() {
	//exports.irc = start("irc");
	//exports.http = start("http");
	exports.facebook=start("facebook");
});
