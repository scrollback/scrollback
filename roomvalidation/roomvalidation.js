var url = require("url");
var log = require("../lib/logger.js");
var redis = require("../lib/redisProxy.js");


module.exports =function(core){
	core.on("room", function(room, callback) {
		var i,j;
		if(!room.id) return callback(new Error("ID_NOT_SPECIFIED"));
		if(!validateRoom(room.id)) return callback(new Error("INVALID_ROOM_ID"));
		if(!room.type) return callback(new Error("TYPE_NOT_SPECIFIED"));
		if(room.type=="user")	room.owner = room.id;


		redis.get("room:"+room.id, function(err, data) {
			if(!err) {
				try {
					room.old = JSON.parse(data);
					//need to delete the IRC ACCOUNTS
					room.originalId = room.id;
				}catch(e) {
					room.old = {};
				}
			}

			if(room.accounts) {
				for(i=0,l=room.accounts.length; i<l;i++) {
					try {
						console.log(room.accounts[i].id);
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

function validateRoom(room) {
	return (room.match(/^[a-z][a-z0-9\_\-\(\)]{4,32}$/i)?true:false);
}