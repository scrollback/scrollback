var log = require("../../lib/logger.js");
var fs=require("fs"), jade = require("jade");
var url = require("url");
var blockOrigins={};

module.exports = function(core) {
	var pluginContent = "";
	core.on('room', function(r, callback) {
		var err;
		if(!r.id || !r.type)
			return callback(new Error("ROOM_ARG_FAIL"));
		if(!validateRoom(r.id)) return callback(new Error("Room name must be at least 5 characters in length and contain no special characters or whitespaces!"));
		if(r.accounts) {
			for(i=0,l=r.accounts.length; i<l;i++) {
				try {
					u = url.parse(r.accounts[i].id);
				} catch(e) {
					return callback(new Error("INVALID_ACCOUNT"));
				}
			}
		}
		if(r.old.owner && r.owner !== r.old.owner) {
			return callback(new Error("ROOM_AUTH_FAIL"));
		}
		callback();
	});
};

function validateRoom(room){
			return (room.match(/^[a-z][a-z0-9\_\-\(\)]{4,32}$/i)?true:false);
}