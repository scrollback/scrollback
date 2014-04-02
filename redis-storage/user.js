var config = require("../config.js");
var userDB = require('../lib/redisProxy.js').select(config.redis.user);
var occupantDB = require('../lib/redisProxy.js').select(config.redis.occupants);

var core;
module.exports = function(c) {
	core = c;
	core.on("user", function(action, callback) {
		userDB.put("user:{{"+action.user.id+"}}", JSON.stringify(action.user));
		callback();
	}, "storage");
	core.on("init", updateUser, "storage");
};

function updateUser(action, callback) {
	userDB.set("user:{{"+ action.user.id+"}}", action.user, function() {
		if(action.old && action.old.id) {
	        userDB.del("user:{{"+action.old.id+"}}");
	        occupantDB.smembers("user:{{"+action.old.id+"}}:occupantOf", function(err, data) {
	            data.forEach(function(room) {
	                occupantDB.srem("room:{{"+room+"}}:hasOccupants",action.old.id);
	                occupantDB.sadd("room:{{"+room+"}}:hasOccupants",action.user.id);
	            });
	        });
	        occupantDB.rename("user:{{"+action.old.id+"}}:occupantOf","user:{{"+action.user.id+"}}:occupantOf");
	    }
	    callback();
	});
}