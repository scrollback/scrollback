var log = require("../../lib/logger.js");
var fs=require("fs");
var blockOrigins={};

module.exports = function(core) {
	init();
	core.on('message', function(message, callback) {
		if(rejectable(message)) callback(new Error("BANNED_WORD"));
		else callback();
	});
};


function loadOrigins(){
	
	log("Reloading blocked origins");
	
	fs.readFile(__dirname + "/blockedOrigins.txt","utf-8", function (err, data) {
		var originsBuffer={};
		if (err) throw err;
		
		data.split("\n").forEach(function(origin) {
			if (origin) {
				origin= origin.toLowerCase().trim();
				originsBuffer[origin] = true;
			}
		});
		
		blockOrigins=originsBuffer;
	});
}


var init=function(){
	loadOrigins();
	setInterval(loadOrigins,60*60*1000);
};


var rejectable = function(m) {
	var origin;
	
	if(!m.origin) return false;
	origin=m.origin;

	if (blockOrigins[origin]) {
		log("Blocked Origin:" + origin);
		return true;
	}
	
	return false;
};

