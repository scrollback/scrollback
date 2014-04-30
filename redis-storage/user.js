var config = require("../config.js");
var userDB = require('../lib/redisProxy.js').select(config.redisDB.user);
var roomDB = require('../lib/redisProxy.js').select(config.redisDB.room);
var occupantDB = require('../lib/redisProxy.js').select(config.redisDB.occupants);

var get = require("./get.js");
var put = require("./put.js");


var core;

function getUserById(id, callback) {
	return get("user", id, function(err, data) {
        if(err || !data) return callback();
        return callback(null, data);
    });    
}

function onGetUsers(query, callback) {
    if(query.ref) {
        if(query.ref == 'me' ) {
            get("session", query.session, function(err, sess) {
            	if(sess){
            		get("user",sess.user, function(err, data){
	            		if(err || !data){
	            			return callback();
	            		}

	            		query.results = [data]
	            		callback();
	            	});	
            	}else{
            		callback();
            	}
            	
            })
        } else{
        	getUserById(query.ref, function(err, data){

        		if(err || !data){
        			return callback();
        		}
        		query.results = [data]
        		callback();
        	});
        }
    } else if(query.occupantOf) {
        return occupantDB.smembers("room:{{"+query.occupantOf+"}}:hasOccupants", function(err, data) {
            if(err) return callback(err);
            if(!data || data.length==0) {
                query.results = [];
                return callback();
            }
            data = data.map(function(e) {
                return "user:{{"+e+"}}";
            });
            occupantDB.mget(data, function(err, data) {
                if(!data) {
                    query.results = [];
                    return callback();
                }
                data = data.map(function(e) {
                    return JSON.parse(e);
                });
                query.results = data;
                return callback();
            });
        });
    }else {
        callback();
    }
}

function updateUser(action, callback) {
    if(action.auth && !action.user.id) {
        return callback();
    }
	put("user", action.user.id, action.user, function() {
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

module.exports = function(c) {
	core = c;
	core.on("user", function(action, callback) {
		userDB.set("user:{{"+action.user.id+"}}", JSON.stringify(action.user));
		callback();
	}, "storage");
	core.on("init", updateUser, "storage");
	core.on("getUsers", onGetUsers, "cache");
};