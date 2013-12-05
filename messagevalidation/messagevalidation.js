var url = require("url");
var log = require("../lib/logger.js");

module.exports = function(core) {
	core.on("message", function(message, callback) {
		var i,j;
		log("Heard \"message\" event");
		if(!message.id ) return callback(new Error("ID_NOT_SPECIFIED"));
		if(message.type == "text"){
			if(!validateRoom(typeof message.to=="string"?message.to:message.to[0])) return callback(new Error("INVALID_ROOM_ID"));
			if(!validateRoom(message.from.replace(/^guest-/,""))) return callback(new Error("INVALID_USER_ID"));
		}
		if(message.type == "text"){
			if( message.text.indexOf('/')==0){
				if(!message.text.indexOf('/me')==0){
					return callback(new Error("UNRECOGNIZED_SLASH_COMMNAD"));
				}  
			}
		}
		if(message.to) message.to = sanitizeRoomName(typeof message.to=="string"?message.to:message.to[0]);
		/*
			Any other validations needed?
		*/
		callback();
	}, "validation");

};

function validateRoom(room) {
	return (room.match(/^[a-z][a-z0-9\_\-\(\)]{4,32}$/i)?true:false);
}

function sanitizeRoomName(room){
	//this function replaces all spaces in the room name with hyphens in order to create a valid room name
	room = room.trim();
	room = room.replace(/ /g, "-");
	return room;
}