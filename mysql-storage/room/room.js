var db = require("../../lib/mysql.js");
var log = require("../../lib/logger.js");
var roomsApi = require("../rooms/rooms.js"); // This no longer has to be changed :-)
var rooms = {}, core;
var redis = require("../../lib/redisProxy.js");

module.exports = function(coreObject) {
	var room = {};
	core =coreObject;
	core.on("room", function(room, callback) {
		db.query("INSERT INTO `rooms`(`id`, `type`, `name`, `description`, `picture`, `profile`, `createdOn`,"+
				"`owner`, `params`) values(?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE "+
				"`id`=values(`id`),`type`=values(`type`),`name`=values(`name`),`description`=values(`description`)"+
				",`picture`=values(`picture`), `profile`=values(`profile`),  `owner`=values(`owner`),"+
				"`params`=values(`params`)", [room.id, room.type, room.name || "", room.description || "",
				room.picture || "", room.profile || "",room.createdOn || new Date().getTime(), room.owner, JSON.stringify(room.params|| {})],
			function(err, resp) {

				if(err) {
					callback && callback(err);
					return;
				}
				if (room.accounts && room.accounts.length>0) {
					insertAccounts(room, function(err, room) {
						if(err) return callback(err, room);
						callback && callback(null, room);
					});
				}else {
					db.query("delete from accounts where `room`=?",[room.id],function(err,res) {});
					callback && callback(null, room);
				}
			}
		);
	}, "storage");

	core.on("room", function(room, callback) {
		redis.set("room:"+room.id, JSON.stringify(room));
		callback();
	}, "cache");
};

function insertAccounts(data,callback){
	var account, accountsQuery=" INSERT INTO `accounts`(id, room, gateway, params, timezone)  VALUES", //?
		accountValues=" (?,?,?,?,?) ",params=[], ids = [];

	data.accounts.forEach(function(element) {
		var id = element.id, room = data.id, gateway;
		gateway = element.id.split(":")[0];
		accountsQuery += accountValues;
		ids.push(room);
		params.push(id);
		params.push(room);
		params.push(gateway);
		if (!element.params) {
			params.push("{}");
		}else{
			params.push(JSON.stringify(element.params));	
		}
		params.push(element.timezone || 0);
	});

	db.query("delete from accounts where `room`=?",[data.originalId || ids],function(err,res) {
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
