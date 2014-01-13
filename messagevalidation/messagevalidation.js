var url = require("url");
var log = require("../lib/logger.js");
var guid = require("../lib/guid.js");
var validateRoom = require('../lib/validate.js');
module.exports = function(core) {
	core.on("message", function(message, callback) {
		var i,j;
		log("Heard \"message\" event");
		if(message.to) {
			if(typeof message.to === "string") message.to = [message.to];
			message.to = message.to.map(function(room) {
				return sanitizeRoomName(room);
			});
		}
		if(!message.id )	message.id = guid();
		if(!validateRoom(message.from.replace(/^guest-/,""))) {
			if (message.origin && message.origin.gateway == "irc") message.from ="guest-"+ sanitizeRoomName(message.from.replace(/^guest-/,""));
			else return callback(new Error("INVALID_USER_ID"));     
        } 
		if(message.type == "text"){
			if(!validateRoom(typeof message.to=="string"?message.to:message.to[0])) return callback(new Error("INVALID_ROOM_ID"));
			if( message.text.indexOf('/')==0){
				if(!message.text.indexOf('/me')==0){
					return callback(new Error("UNRECOGNIZED_SLASH_COMMNAD"));
				} 
			}
		}
		if(message.type == "join" || message.type == "part"){
			if(/^guest-/.test(message.to)){
				return callback(new Error("GUEST_CANNOT_HAVE_MEMBERSHIP"));
			}
		}
		/*
			Any other validations needed?
		*/
		callback();
	}, "validation");

};

function sanitizeRoomName(room) {
	//this function replaces all spaces in the room name with hyphens in order to create a valid room name
	room = room.trim();
	room = room.replace(/[^a-zA-Z0-9]/g,"-").replace(/^-+|-+$/,"");
	if(room.length<3) room=room+Array(4-room.length).join("-");
	return room;
}