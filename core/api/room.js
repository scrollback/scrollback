var pool = require("../data.js");
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
		console.log("Caching rooms", element.id);
	});
});


module.exports = function(data, callback) {
	var room = {};
	pool.get(function(err, db) {
		if (typeof data === "object") {
			var properties = [], currentRoom;
			if(err && callback) {
				db.end();
				return callback(err);
			}
			if(rooms[data.id]) {
				rooms[data.id] = data;
				// properties = Object.keys(data)
				// properties.forEach( function(element) {
				// 	if(data[element]) {
				// 		if(element == "params") {
				// 			if(typeof data.params =="string")
				// 				data.params = JSON.parse(data.params);
				// 			Object.keys(data.params).forEach( function(element) {
				// 				if(data.params[element] !== undefined)
				// 					currentRoom.params[element] = data.params[element];
				// 			});
				// 		}
				// 		else {
				// 			currentRoom[element] = data[element];
				// 		}
				// 	}
				// });
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
				else{
					callback(new Error("NO_TYPE"),null);
				}
			}
			db.query("INSERT INTO `rooms`(`id`, `type`, `name`, `description`, `picture`, `profile`, `createdOn`,"+
					"`owner`, `params`) values(?,?,?,?,?,?,NOW(),?,?) ON DUPLICATE KEY UPDATE "+
					"`id`=values(`id`),`type`=values(`type`),`name`=values(`name`),`description`=values(`description`)"+
					",`picture`=values(`picture`), `profile`=values(`profile`),  `owner`=values(`owner`),"+
					"`params`=values(`params`)", [room.id, room.type || "user", room.name || "", room.description || "",
					room.picture || "", room.profile || "", room.owner, JSON.stringify(room.params|| {})],
			function(err, resp) {
				db.end();

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
					getAccounts(room, function(err, room) {
						callback(err,room);
					});
				}
			});
		}
		else {
			if(rooms[data]) {
				room = rooms[data];
				if(!room.accounts) {
					return getAccounts(room, function(err, room) {
						rooms[data].accounts = room.accounts
						return callback(err, room);
					});
				}
				return callback(err, room);
			}else{
				db.query("SELECT * FROM `rooms` WHERE `id`=? ", [data], function(err, room){
					db.end();
					if(err) return callback(err);
					if(room.length == 0) {
						return callback(null,{});
					}
					getAccounts(room, function(err, room) {
						return callback(err, room);
					});
				});
			}
		}
	});
};

// accounts is an array of strings.
function insertAccounts(data,callback){
	var account, accountsQuery=" INSERT INTO `accounts` VALUES ", //?
		accountValues=" (?,?,?,?) ",params=[], ids = [];
	pool.get(function(err, db) {
		if (err && callback) callback(err,res);
		
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
			if (err && callback) {
				db.end();
				callback(err,res);
			}
			if( data.accounts.length){
				db.query(accountsQuery,params,function(err,account){
					db.end();
					if(callback) callback(err, data);
				});
			}
			else {
				if(callback) callback(err, data);
			}
			
		});
	});	
}

function getAccounts(room,callback) {
	pool.get(function(err, db) {
		if(rooms[room.id] && typeof rooms[room.id].accounts == "object")
			return callback(null, rooms[room.id]);
		db.query("SELECT * FROM `accounts` WHERE `room`=?", [room.id], function(err, accounts) {
			db.end();
			if(err) return callback(err, room);
			room.accounts = accounts;
			callback(null, room);
		});
	});
}
