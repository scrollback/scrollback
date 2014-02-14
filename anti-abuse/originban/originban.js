var log = require("../../lib/logger.js");
var fs=require("fs"), jade = require("jade");
var blockOrigins={};

module.exports = function(core) {
	var pluginContent = "";
	init();
	fs.readFile(__dirname + "/originban.jade", "utf8", function(err, data){
		if(err)	throw err;
		//this is a function object.
		pluginContent = jade.compile(data,  {basedir: process.cwd()+'/http/views/' });
		// core.on("config", function(payload, callback) {
		// 	log("Heard \"config event\"");
  //           payload.originban = pluginContent;
  //           callback(null, payload);
  //       });
	});
	core.on('message', function(message, callback) {
		log("Heard \"message event\"");
		if (message.origin && message.origin.gateway == "irc") return callback();
		if(rejectable(message)) callback(new Error("BANNED_WORD"));
		else callback();
	}, "antiflood");
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

