var core = Object.create(require("./lib/emitter.js")), config = require("./config.js");

process.nextTick(function(){
	// The ident server binds to port 113 after a while.
	if(config.core.uid) process.setuid(config.core.uid);
});
process.title = config.core.name;

function start(name) {
	var plugins = ["auth","roomauth","repeatban", "ratelimit", "wordban", "usernameban" , "originban", "loginrequired", 
    	"members","http", "irc" , "occupants" , "room", "rooms" , "message" , "messages" , "roomvalidation" , 
    	"messagevalidation" , "threader1"];
	var plugin = require("./"+name+"/"+name+".js");
	plugin(core);
}

config.plugins.forEach(function(name) {
	start(name);
});
