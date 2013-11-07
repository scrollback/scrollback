var core = require("./core/core.js"),
	plugins = require("./core/plugins.js"),
	config = require("./config.js");

process.nextTick(function(){
	// The ident server binds to port 113 after a while.
	if(config.core.uid) process.setuid(config.core.uid);
});
process.title = config.core.name;

//put in id as "newFrame" and the "src" of the irccloud in the src and we are good to go to be put in anywhere in the page a user wants to.
document.write('<iframe id="newFrame" src="http://scrollback.io" width="350" height="500" marginwidth="0" marginheight="0" frameborder="0" style="border: #000000 1px solid;"></iframe>')