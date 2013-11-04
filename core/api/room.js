	var db = require("../data.js");
var log = require("../../lib/logger.js");
var roomsApi = require("./rooms"); // This has to be changed.
var rooms = {}, core = {};

/*This too has to be changes. But felt this is better than a adding 
	process.nexttick to require core.*/
roomsApi({query:""}, function(err, data){
	if(err)	throw err;
	data.forEach(function(element) {
		rooms[element.id] = element;
		try {
			rooms[element.id].params = JSON.parse(element.params);
		} catch(e) {
			rooms[element.id].params = {};
		}
		log("Caching rooms", element );
	});
});


module.exports = function(data, callback) {
		var room = {};
		if (typeof data === "object") {
			var properties = [], currentRoom;
			if(rooms[data.id]) {
				rooms[data.id] = data;
				room = data;
			} else {
				if(data.id && data.type) {
					room = {
						id : data.id,
						type : data.type,
						name : data.name || data.id,
						description : data.description || "",
						picture : data.picture || "",
						profile : data.profile || "", 
						createdOn: new Date(),				
						params : data.params || {},
						owner: data.owner || data.id
					};
					rooms[data.id] = room;
				}
				else {
					callback(new Error("NO_TYPE"),null);
				}
			}
			db.query("INSERT INTO `rooms`(`id`, `type`, `name`, `description`, `picture`, `profile`, `createdOn`,"+
					"`owner`, `params`) values(?,?,?,?,?,?,unix_timestamp(),?,?) ON DUPLICATE KEY UPDATE "+
					"`id`=values(`id`),`type`=values(`type`),`name`=values(`name`),`description`=values(`description`)"+
					",`picture`=values(`picture`), `profile`=values(`profile`),  `owner`=values(`owner`),"+
					"`params`=values(`params`)", [room.id, room.type || "user", room.name || "", room.description || "",
					room.picture || "", room.profile || "", room.owner, JSON.stringify(room.params|| {})],
			function(err, resp) {

				if(err && callback) return callback(err,data);
				
				if (data.accounts) {
					insertAccounts(data,function(err,data) {
						if(err) return callback(err,data);
						if(typeof data.originalId == "undefined")
							rooms[data.id].accounts = data.accounts;
						if (callback) {
							callback(err,data);
						} 
					});
				}
				else {
					getAccounts(room, function(err, accounts) {
						if(err) return callback(err);
						room.accounts = accounts;
						callback(err,room);
					});
				}
			});
	}
	else {
			if(rooms[data]) {
				room = rooms[data];
				if(!room.accounts) {
					return getAccounts(room, function(err, accounts) {
						if(err) return callback(err);
						rooms[data].accounts = accounts;
						return callback(null, rooms[data]);
					});
				}
				return callback(null, room);
			}else{
				db.query("SELECT * FROM `rooms` WHERE `id`=? ", [data], function(err, room){
					if(err) return callback(err);
					if(room.length == 0) {
						return callback(null,{});
					}
					getAccounts(room[0], function(err, accounts) {
						if(err) return callback(err);
						room.accounts = accounts;
						return callback(err, room);
					});
				});
			}
	}
};

function insertAccounts(data,callback){
	var account, accountsQuery=" INSERT INTO `accounts` VALUES ", //?
		accountValues=" (?,?,?,?) ",params=[], ids = [];
	
	data.accounts.forEach(function(element) {
		var id = element.id, room = data.id, gateway;
		gateway = element.id.split(":")[0];
		
		accountsQuery += accountValues;
		ids.push(room);
		params.push(id);
		params.push(room);
		params.push(gateway);
		params.push("{}");			
	});

	db.query("delete from accounts where `room`=?",data.originalId || ids,function(err,res) {
		if (err && callback) callback(err,res);

		if( data.accounts.length){
			db.query(accountsQuery,params,function(err,account){
				if(callback) callback(err, data);
			});
		}
		else {
			if(callback) callback(err, data);
		}
		
	});
}

function getAccounts(room,callback) {
	db.query("SELECT * FROM accounts WHERE `room`=?", [room.id], function(err, accounts) {
		if(err) return callback(err);
		callback(null, accounts);
	});
}