var db = require("../data.js");
var log = require("../../lib/logger.js");
var usersApi = require("./users"); // This has to be changed.
var users = {}, core = {};

/*This too has to be changes. But felt this is better than a adding 
	process.nexttick to require core.*/
usersApi({query:""}, function(err, data){
	if(err)	throw err;
	data.forEach(function(element) {
		users[element.id] = element;
		try {
			users[element.id].params = JSON.parse(element.params);
		} catch(e) {
			users[element.id].params = {};
		}
		log("Caching users", element.id);
	});
});


module.exports = function(data, callback) {
	var user = {};
	if (typeof data === "object") {
		var properties = [], currentUser;
		if(users[data.id]) {
			users[data.id] = data;
			user = data;
		} else {
			if(data.id && data.type) {
				user = {
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
				users[data.id] = user;
			}
			else{
				callback(new Error("NO_TYPE"),null);
			}
		}
		db.query("INSERT INTO `users`(`id`, `type`, `name`, `description`, `picture`, `profile`, `createdOn`,"+
				"`owner`, `params`) values(?,?,?,?,?,?,NOW(),?,?) ON DUPLICATE KEY UPDATE "+
				"`id`=values(`id`),`type`=values(`type`),`name`=values(`name`),`description`=values(`description`)"+
				",`picture`=values(`picture`), `profile`=values(`profile`),  `owner`=values(`owner`),"+
				"`params`=values(`params`)", [user.id, user.type || "user", user.name || "", user.description || "",
				user.picture || "", user.profile || "", user.owner, JSON.stringify(user.params|| {})],
		function(err, resp) {

			if(err && callback) return callback(err,data);
			
			if (data.accounts) {
				insertAccounts(data,function(err,data) {
					if(err) return callback(err,data);
					if(typeof data.originalId == "undefined")
						users[data.id].accounts = data.accounts;
					if (callback) {
						callback(err,data);
					} 
				});
			}
			else {
				getAccounts(user, function(err, user) {
					callback(err,user);
				});
			}
		});
	}
	else {
		if(users[data]) {
			user = users[data];
			if(!user.accounts) {
				return getAccounts(user, function(err, user) {
					users[data].accounts = user.accounts
					return callback(null, user);
				});
			}
			return callback(null, user);
		}else{
			db.query("SELECT * FROM `users` WHERE `id`=? ", [data], function(err, user){
				if(err) return callback(err);
				if(user.length == 0) {
					return callback(null,{});
				}
				getAccounts(user, function(err, user) {
					return callback(err, user);
				});
			});
		}
	}
};

function insertAccounts(data,callback){
	var account, accountsQuery=" INSERT INTO `accounts` VALUES ", //?
		accountValues=" (?,?,?,?) ",params=[], ids = [];
	
	data.accounts.forEach(function(element) {
		var id = element.id, user = data.id, gateway;
		gateway = element.id.split(":")[0];
		
		accountsQuery += accountValues;
		ids.push(user);
		params.push(id);
		params.push(user);
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

function getAccounts(user,callback) {
	if(users[user.id] && typeof users[user.id].accounts == "object")
		return callback(null, users[user.id]);
	db.query("SELECT * FROM `accounts` WHERE `user`=?", [user.id], function(err, accounts) {
		if(err) return callback(err, user);
		user.accounts = accounts;
		callback(null, user);
	});
}
