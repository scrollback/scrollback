var db = require("../lib/mysql.js");
var log = require("../lib/logger.js");
var redis = require("../lib/redisProxy.js");
var core;

function rooms(coreObject) {
	core = coreObject;
	core.on("rooms",function(options, callback) {
		log("Heard rooms event cache", options);
		if(options.id){
			redis.get("room:"+options.id, function(err, data){
				//redis returns null if key not found
				if(!data) {
					return callback();
				}
				try{
					data = JSON.parse(data);
					console.log("cache rooms called", data);
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
			if(!callback) return;
			if(!err) err = true;
			else return callback(err);
			console.log("DATA-SO-FAR", data);
			console.log("***", err);
			data.forEach(function(element) {
				try{
					element.params = JSON.parse(element.params);
				}catch(e){
					element.params = {};
				}
			});
			if(options.fields && data.length > 0) {
				console.log("fields defined");
				options.fields.forEach(function(element) {
					if(element == "accounts" && options.id) {
						console.log("getting accounts", options.id);
						getAccounts(options.id, function(err, accounts) {
							if(err) return callback(err);
							console.log("got accounts", accounts);
							data[0].accounts = accounts;
							return callback(true, data);
						});
					}
				});
			}
			else {
				if(callback) callback(err, data);
			}
		});
	}, "storage");

	/*This too has to be changes. But felt this is better than a adding 
	process.nexttick to require core.*/
	core.emit("rooms", {query:"", type:"room"}, function(err, data){
		if(err)	throw err;
		data.forEach(function(element) {
			redis.set("room:"+element.id, JSON.stringify(element));
		});
	});
};

function getAccounts(ids,callback) {
	db.query("SELECT * FROM accounts WHERE `room` = ?", [ids], function(err, accounts) {
		if(err) return callback(err);
		callback(null, accounts);
	});
}
module.exports = rooms;