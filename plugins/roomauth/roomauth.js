var log = require("../../lib/logger.js");
var fs=require("fs"), jade = require("jade");
var blockOrigins={};

module.exports = function(core) {
	var pluginContent = "";
	console.log("room: auth called");
	core.on('room', function(room, callback) {
		console.log("room: auth called");
		if(rejectable(room)) callback(new Error("ROOM_AUTH_FAIL"));
		else callback();
	});
};

var rejectable = function(r) {
	var origin;
	
	if(!r.id || !r.type)
		return true;
	console.log(r);
	if(r.old.owner && r.owner !== r.old.owner) {
		return true;
	}
	return false;
};

