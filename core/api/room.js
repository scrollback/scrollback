var pool = require("../data.js");
var log = require("../../lib/logger.js");
var roomsApi = require("./rooms"); // This has to be changed.
var rooms = {};



/*This too has to be changes. But felt this is better than a adding 
	process.nexttick to require core.*/
roomsApi({type : "room"}, function(err, data){
	if(err)	throw err;

	data.forEach(function(element) {
		rooms[element.id] = element;
		console.log(element.params);
		rooms[element.id].params = JSON.parse(element.params);
		console.log("Caching rooms", element.id);
	});
});


module.exports = function(data, callback) {
	var room = {};
	if (typeof data === "object") {
		pool.get(function(err, db) {
			var properties = [], currentRoom;
			if(err && callback) return callback(err);
			
			if(rooms[data.id]) {
				currentRoom = rooms[data.id];
				properties = Object.keys(data)
				properties.forEach( function(element) {
					if(data[element]) {
						if(element == "params") {
							Object.keys(data.params).forEach( function(element) {
								console.log(element, data.params[element]);
								if(data.params[element] !== undefined)
									currentRoom.params[element] = data.params[element];
							});
						}
						else {
							currentRoom[element] = data[element];
						}
					}
				});
				room = currentRoom;
			} else{
				room = {
					id : data.id,
					type : data.type || "user",
					name : data.name || "",
					description : data.description || "",
					picture : data.picture,
					profile : data.profile || "", 
					owner : data.owner || data.id,
					params : data.params || ""
				};
				rooms[data.id] = room;
			}
			

			db.query("INSERT INTO `rooms`(`id`, `type`, `name`, `description`, `picture`, `profile`, `createdOn`,"+
				"`owner`, `params`) values(?,?,?,?,?,?,NOW(),?,?) ON DUPLICATE KEY UPDATE "+
				"`id`=values(`id`),`type`=values(`type`),`name`=values(`name`),`description`=values(`description`)"+
				",`picture`=values(`picture`), `profile`=values(`profile`), `createdOn`=NOW(), `owner`=values(`owner`),"+
				"`params`=values(`params`)", [room.id, room.type || "user", room.name || "", room.description || "",
				room.picture || "", room.profile || "", room.owner||room.id, JSON.stringify(room.params)|| ""],
			function(err, data) {
				db.end();
				if(err && callback) return callback(err,data);
				
				if (data.accounts && data.accounts.length>0) {
					insertAccounts(room,function(err,data) {
						if(err) return callback(err,data);
						rooms[data.id].accounts = data.accounts;
						if (callback) callback(err,data);
					});	
				}
				else{
					console.log("no accounts;");
					callback(null,room);
				}
			});
			
		});
	}
	else {
		pool.get(function(err, db) {
			if(rooms[data])
				return callback(null, rooms[data]);
			db.query("SELECT * FROM `rooms` WHERE `id`=? ", [data], function(err, room){
				if(err) return callback(err);
				db.query("SELECT * FROM `accounts` WHERE `room`=?", [data], function(err, accounts) {
					db.end();
					if(err) return callback(err);
					if(!room.accounts) room.accounts = [];
					if (callback) callback(err, room);
				});
			});
		});
	}
	
};

// accounts is an array of strings.
function insertAccounts(data,callback){
	var account, accountsQuery=" INSERT INTO `accounts` VALUES ", //?
		accountValues=" (?,?,?,?) ",params=[];
	pool.get(function(err, db) {
		if (err && callback) callback(err,res);
		
		data.accounts.forEach(function(element) {
			var id = element, room = data.id, gateway;
			gateway = element.split(":")[0];
			
			accountsQuery += accountValues;
			params.push(id);
			params.push(room);
			params.push(gateway);
			params.push("");
			
			// params.push([id, room, gateway, '']);
		});
		
		db.query("delete from accounts where `room`=?",data.originalId,function(err,res){
			if (err && callback) {
				db.end();
				callback(err,res);
			}
			db.query(accountsQuery,params,function(err,account){
				db.end();
				if(callback) callback(err, data);
			});

		});
	});	
}