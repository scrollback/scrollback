
var sync = require('sync');
var request = require('request');


function start(name) {
	var gateway = require("../gate/"+name+"/"+name+".js");
	gateway.init();
	return gateway;
}
module.exports = {};
exports.irc = start("irc");
exports.http = start("http");



/*
var facebook=function(data){
		var result=request.sync(null,"https://graph.facebook.com/me?fields=id&access_token=" + data.token);
		console.log("blah");
		return result;
	}.async();




sync(function(){
	var x=facebook({token:"CAAB6RPSZAQB4BAIUZAaaUFRO5AloB1S02MWtTK8nqOpMRJZAzCrW4cxe69FeZBbhYXYMEhH4roBOjguwhX4zH8C5oUGvpmZBrtCnq3QY1ytJsUmVkM2JPVlKtPXVSffG0L3QoNY142YK5vlkBvqxLI0k5TSgDyhxrkljT72VKLwZDZD"});
	console.log(x);
})
*/