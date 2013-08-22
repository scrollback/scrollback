var log = require("../../lib/logger.js");
var fs=require("fs");
var blockOrigins={};



function loadOrigins(){
	
	log("Reloading blocked origins");
	
	fs.readFile("./plugins/originBlock/blockedOrigins.txt","utf-8", function (err, data) {
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


exports.init=function(){
	loadOrigins();
	setInterval(loadOrigins,60*60*1000);
}


exports.rejectable = function(m) {
	var origin;
	
	if(!m.origin) return false;
	origin=m.origin;

	if (blockOrigins[origin]) {
		log("Blocked Origin:" + origin);
		return true;
	}
	
	return false;
};

