var pool = require("../data.js");
var log = require("../../lib/logger.js");

module.exports = function(data, callback) {
	if (typeof data === "object") {
		pool.get(function(err, db) {
			if(err && callback) return callback(err);
			
			db.query("INSERT INTO `rooms`(`id`, `type`, `name`, `description`, `picture`, `profile`, `createdOn`,"+
				"`owner`, `params`) values(?,?,?,?,?,?,NOW(),?,?) ON DUPLICATE KEY UPDATE "+
				"`id`=values(`id`),`type`=values(`type`),`name`=values(`name`),`description`=values(`description`)"+
				",`picture`=values(`picture`), `profile`=values(`profile`), `createdOn`=NOW(), `owner`=values(`owner`),"+
				"`params`=values(`params`)", [data.id, data.type || "user", data.name || "", data.description || "",
				data.picture || "", data.profile || "", data.owner|| data.id,data.params|| ""],
			function(err, room) {
				db.end();
				if(err && callback) return callback(err,data);
				
				if (data.accounts.length>0) {
					insertAccounts(data,function(err,data){
						if (callback) callback(err,data);
					});	
				}
				else{
					console.log("no accounts;");
					callback(null,data);
				}
			});
			
		});
	}
	else {
		pool.get(function(err, db) {
			db.query("SELECT * FROM `rooms` WHERE `id`=? ", [data], function(err, room){
				if(err) return callback(err);
				db.query("SELECT * FROM `accounts` WHERE `room`=?", [data], function(err, accounts) {
					if(err) return callback(err);
					if(!room.accounts) room.accounts = [];
					
					db.end();
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
		
		if (data.accounts.length>0) {
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
				if (err && callback) callback(err,res);
				
				db.query(accountsQuery,params,function(err,account){
					db.end();
					if(callback) callback(err, data);
				});

			});
			
			return;
		}
	});
	
}