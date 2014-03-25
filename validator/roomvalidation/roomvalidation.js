	var url = require("url");
var log = require("../../lib/logger.js");
var redis = require("../../lib/redisProxy.js");
var validateRoom = require('../../lib/validate.js');
var crypto = require('crypto');
var getAvatarText = require('../../lib/getAvatarText.js');

module.exports =function(core){
	core.on("room", function(room, callback) {
		var i,j, avatarText;
		if(!room.id) return callback(new Error("ID_NOT_SPECIFIED"));
		else	room.id = room.id.toLowerCase();
		if(!validateRoom(room.id)) return callback(new Error("INVALID_ROOM_ID"));
		if(!room.type) return callback(new Error("TYPE_NOT_SPECIFIED"));
		if(room.type=="user")	{
			room.owner = room.id;
			avatarText = getAvatarText(room.id);
			room.accounts.forEach(function(account){
		        room.picture = crypto.createHash("md5").update(account.id.substring(7)).digest("hex");
		        room.picture = '//s.gravatar.com/avatar/' + room.picture  + '/?d=retro' + '&s=48' ; 
				//encodeURIComponent('http://scrollback.io/img/default-avatar/') + avatarText +
			});
		}
		if(!room.createdOn) room.createdOn = new Date().getTime();
		if(!room.name) room.name=room.id;


		if(room.type!="user" && /^guest-/.test(room.owner)) return callback(new Error("CANNOT_CONFIGURE_AS_GUEST"));
		//need to delete the IRC ACCOUNTS
		room.originalId = room.id;
		log("heard room event", room);
		redis.get("room:{{"+room.id+"}}", function(err, data) {
			if(err) callback(err);
			if(data){
				try {
					room.old = JSON.parse(data);
				}catch(e) {
					log(e);
					room.old = {};
				}
			}
			if(room.type!="user" && room.old && room.old.owner && room.owner !== room.old.owner) return callback(new Error("NOT_ADMIN"));
			if(room.accounts) {
				for(i=0,l=room.accounts.length; i<l;i++) {
					try {
						log(room.accounts[i].id);
						u = url.parse(room.accounts[i].id);
					} catch(e) {
						return callback(new Error("INVALID_ACCOUNT"));
					}
				}
			}
			/*
				Any other validations needed?
			*/
			callback();
		});
	}, "validation");
};
