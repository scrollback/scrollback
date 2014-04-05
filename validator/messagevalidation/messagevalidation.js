var url = require("url");
var log = require("../../lib/logger.js");
var guid = require("../../lib/guid.js");
var validateRoom = require('../../lib/validate.js');
module.exports = function(core) {
	core.on("edit", function(action, callback) {
		if(action.room.owner && action.user.id != action.room.owner) {
			return callback(new Error("NOT_ADMIN"));
		}else{
			callback();
		}
	},"validation");
	core.on("message", function(message, callback) {
		var i,j, hashmap = {};
		if(message.to) {
			if(typeof message.to === "string") message.to = [message.to];
			message.to = message.to.map(function(room) {
				return validateRoom(room, true);
			});
		}else{
			if(message.type == "back") {
				message.to = [];	
			}
		}
		if(!message.id )	message.id = guid();

		if(!message.from) return callback(new Error("INVALID_USER_ID"));
		
		if(message.from && !validateRoom(message.from.replace(/^guest-/,""))) {
			/* this is a temp things. because if the a user sends a msg with a invalid name 
			and we send the data back to him with a sanitized name, the code will not know that he sent it. 
			this will have side effects. So only sanitizing irc messages. */
			if (message.origin && message.origin.gateway == "irc") message.from ="guest-"+ validateRoom(message.from.replace(/^guest-/,""), true);
			else return callback(new Error("INVALID_USER_ID"));
        }
		if(message.type == "text"){
			if( message.text.indexOf('/')==0){
				if(!message.text.indexOf('/me')==0){
					return callback(new Error("UNRECOGNIZED_SLASH_COMMNAD"));
				}
			}
			if(message.mentions && message.mentions.length > 0 ){
				//checking for multiple mentions for the same user
				message.mentions.forEach(function(i){
					hashmap[i] = "";
				});
				message.mentions = Object.keys(hashmap);
			}
		}
		if(message.type == "join" || message.type == "part"){
			if(/^guest-/.test(message.from)){
				return callback(new Error("GUEST_CANNOT_HAVE_MEMBERSHIP"));
			}
		}
		/*
			Any other validations needed?
		*/
		callback();
	}, "validation");

};
