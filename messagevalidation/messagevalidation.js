var url = require("url");
var log = require("../lib/logger.js");

module.exports = function(core) {
	core.on("message", function(message, callback) {
		var i,j;
		log("Heard \"message\" event");
		if(!message.id ) return callback(new Error("ID_NOT_SPECIFIED"));
		if(message.type == "text"){
			if(!validateRoom(message.to)) return callback(new Error("INVALID_ROOM_ID"));
			if(!validateRoom(message.from)) return callback(new Error("INVALID_USER_ID"));
		}
		/*
			Any other validations needed?
		*/
		callback();
	}, "validation");

};

function validateRoom(room) {
	return (room.match(/^[a-z][a-z0-9\_\-\(\)]{4,32}$/i)?true:false);
}