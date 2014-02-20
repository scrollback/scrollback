var db = require("../../lib/mysql.js");
var log = require("../../lib/logger.js");
var redis = require("../../lib/redisProxy.js");
var core;

function rooms(coreObject) {
	core = coreObject;
	core.on("rooms",function(options, callback) {
		log("Heard rooms event cache", options);
		if(options.id && typeof options.id == "string"){
			redis.get("room:{{"+options.id+"}}", function(err, data){
				var i,l;
				//redis returns null if key not found
				if(!data) {
					return callback();
				}
				try{
					data = JSON.parse(data);
					if(options.fields) {
						for(i=0, l=options.fields.length;i<l;i++){
							if(!data[options.fields[i]]) return callback();
						}
					}
					return callback(true, [data]);
				}catch(e){
					return callback();
				};
			});
		}else{
			callback();
		}
	},"cache");
	core.on("rooms", function(options, callback) {
		var query = "SELECT * FROM `rooms` ",
			where = [],	 params=[], desc=false, limit=256, accountIDs = [];

		log("Heard rooms event", options);

		if(options.id) {
			if(options.id.length == 0) return callback(true, []);
			where.push("`id` in (?)");
			params.push(options.id);
		}
		if(options.type) {
			where.push("`type` = ?");
			params.push(options.type);
		}

		if(options.query) {
			where.push("(`name` LIKE ? OR `description` LIKE ?)");
			options.push("%"+query+"%");
			options.push("%"+query+"%");
		}

		if(options.accounts) {
			where.push("`id` IN (SELECT `room` FROM `accounts` WHERE `id` IN (?))");
			options.accounts.forEach(function(element){
				accountIDs.push(element.id);
			});
			params.push(accountIDs);
		}

		if(where.length) query += " WHERE " + where.join(" AND ");

		// should find a way to get all the rooms when needed by application(currently for caching rooms). until then no limit.
		//query += " LIMIT 64";

		log(query, params);
		db.query(query, params, function(err, data) {
			var ids, rooms=[];
			if(!callback) return;
			if(!err) err = true;
			else return callback(err);
			data.forEach(function(element) {
				rooms[element.id] = element;
				try{
					element.params = JSON.parse(element.params);
				}catch(e){
					element.params = {};
				}
				if(!element.accounts) element.accounts = [];
			});

			if(options.fields) {
				if(options.id && typeof options.id !=="string") {
					options.id.forEach(function(id) {
						if(!rooms[id]) {
							rooms[id] = {
								id:options.id,
								name:options.id,
								params : {},
								accounts : []
							};
						}
					});
				}else if(options.id && data.length ==0) {
					data[0]=rooms[options.id] = {
						id:options.id,
						name:options.id,
						params : {},
						accounts : []
					};
				}
				ids = Object.keys(rooms);
				function getFields(fields,index, callback) {
					if(index >= fields.length) return callback();
					if(fields[index] == "accounts" && ids.length) {
						getAccounts(ids, function(err, accounts) {
							var accountsInfo={};
							if(err) return callback(err);
							accounts.forEach(function(element) {
								rooms[element.room].accounts.push(element);
							});
							return getFields(fields, index+1, callback);
						});
					}
					if(fields[index] == "members" && ids.length) {
						getMembers(ids,function(err, roomMembers) {
							if(err) return callback(err);
							Object.keys(roomMembers).forEach(function(roomId) {
								rooms[roomId].members = roomMembers[roomId];
							});
							return getFields(fields, index+1, callback);
						});
					}
				}
				getFields(options.fields, 0, function(){
					return callback(true, data);
				});
			}
			else {
				if(callback) callback(err, data);
			}
		});
	}, "storage");

	core.emit("rooms", {query:"", type:"room", fields:["accounts"]}, function(err, data){
		if(err)	throw err;
		data.forEach(function(element) {
			redis.set("room:{{"+element.id+"}}", JSON.stringify(element));
		});
	});
};

function getAccounts(ids,callback) {
	db.query("SELECT * FROM accounts WHERE `room` in (?)", [ids], function(err, accounts) {
		if(err) return callback(err);
		
		
		accounts.forEach(function(account) {
			account.params = JSON.parse(account.params);
		});
		callback(null, accounts);
	});
}

function getMembers(ids, callback) {
	core.emit("members" ,{room:ids}  , function(err , members) {
		if(err) return callback(err);
		var ids=[], user = {}, rooms = {};
		members.forEach(function(element) {
		    ids.push(element.user);
		    if(!rooms[element.room]) rooms[element.room] = [];
		    rooms[element.room].push(element.user);
		    user[element.user] = element.user;
		});
		db.query("select * from rooms where id in (?)",[ids], function(err, users) {
			if(err) return callback(err);
			var returnData = {};
			users.forEach(function(element) {
				user[element.id] = element;
			});
			Object.keys(rooms).forEach(function(roomId) {
				rooms[roomId].forEach(function(id) {
					if(!returnData[roomId]) returnData[roomId] =[];
					returnData[roomId].push(user[id]);
				})
			});
			callback(null, returnData);
		});
	});
}

module.exports = rooms;
