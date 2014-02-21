var log = require("../lib/logger.js");
//var config = require('../../config.js');
var redisProxy = require('../lib/redisProxy.js');

module.exports = function(core) {
    core.on("back", function(data, cb){
        // redisProxy.set("room:{{"+data.to+"}}", JSON.stringify(data.room));
        // redisProxy.set("user:{{"+data.from+"}}", JSON.stringify(data.user));
        redisProxy.sadd("room:{{"+data.to+"}}:hasOccupants", data.from);
        redisProxy.sadd("user:{{"+data.from+"}}:occupantOf", data.to);
        cb();
    }, "storage");

    core.on("away", function(action, callback) {
        console.log(action);
        redisProxy.srem("room:{{"+action.to+"}}:hasOccupants", action.from, function() {
            redisProxy.scard("room:{{"+action.to+"}}:hasOccupants", function(err, data) {
                if(data==0) {
                    redisProxy.del("room:{{"+action.to+"}}");
                }
            });
        });
        redisProxy.srem("user:{{"+action.from+"}}:occupantOf", action.to, function() {
            redisProxy.scard("user:{{"+action.from+"}}:occupantOf", function(err, data) {
                if(data==0) {
                    redisProxy.del("user:{{"+action.from+"}}");
                }
            });
        });
        callback();
    },"storage");
    function onnickchange(action, callback) {
        if(action.old && action.old.id){
            redisProxy.del("user:{{"+action.old.id+"}}");
            redisProxy.smembers("user:{{"+action.old.id+"}}:occupantOf", function(err, data) {
                data.forEach(function(room){
                    redisProxy.srem("room:{{"+room+"}}:hasOccupants",action.old.id);
                    redisProxy.sadd("room:{{"+room+"}}:hasOccupants",action.user.id);
                });
            });
            redisProxy.rename("user:{{"+action.old.id+"}}:occupantOf","user:{{"+action.user.id+"}}:occupantOf");
        }
        redisProxy.set("user:{{"+action.user.id+"}}");
        callback();
    }
    // core.on("init",onnickchange);
    core.on("message",function(action, callback){
        if(action.type == "nick") {
            redisProxy.del("user:{{"+action.from+"}}");
            redisProxy.smembers("user:{{"+action.from+"}}:occupantOf", function(err, data) {
                data.forEach(function(room){
                    redisProxy.srem("room:{{"+room+"}}:hasOccupants",action.from);
                    redisProxy.sadd("room:{{"+room+"}}:hasOccupants",action.ref);
                });
            });
            if(!/^guest-/.test(action.ref)) {
                core.emit("getUsers",{id: action.ref}, function(err, data) {
                    redisProxy.set("user:{{"+action.ref+"}}", JSON.stringify(data[0]));
                });
            }else{
                if(action.user) {
                    redisProxy.set("user:{{"+action.user.id+"}}", JSON.stringify(action.user));
                }

            }
         

            redisProxy.rename("user:{{"+action.from+"}}:occupantOf","user:{{"+action.ref+"}}:occupantOf");
        }
        callback();
    },"storage");
    core.on("user", function(user, callback) {
        redisProxy.set("user:{{"+user.id+"}}", JSON.stringify(user));
        callback();
    });
    core.on("room", function(room, callback) {
        redisProxy.set("room:{{"+room.id+"}}", JSON.stringify(room));
        callback();
    });

    core.on("getUsers", function(query, callback) {
        if(query.id){
            return redisProxy.get("user:{{"+query.id+"}}", function(err, data) {
                if(err || !data) return callback();
                return callback(true, [JSON.parse(data)]);
            });
        }
        if(query.occupantOf){
            return redisProxy.smembers("room:{{"+query.occupantOf+"}}:hasOccupants", function(err, data) {
                if(err) return callback(err);
                if(!data || data.length==0) return callback(true, []);
                data = data.map(function(e){
                    return "user:{{"+e+"}}";
                });
                redisProxy.mget(data, function(err, data) {
                    if(!data) return callback(true, []);
                    data = data.map(function(e) {
                        return JSON.parse(e);
                    });
                    return callback(true, data);
                });
            });
        }else {
            callback();
        }
    }, "cache");
    core.on("getRooms", function(query, callback) {
        if(query.id) {
            return redisProxy.get("room:{{"+query.id+"}}", function(err, data) {
                if(err || !data) callback();
                if(data) return callback(true, [JSON.parse(data)]);
            });
        }
        if(query.hasOccupants){
            return redisProxy.smembers("user:{{"+query.occupantOf+"}}:occupantOf", function(err, data) {
                if(err) return callback(err);
                data = data.map(function(e){
                    return "room:{{"+e+"}}";
                })
                redisProxy.mget(data, function(err, data) {
                    data = data.map(function(e) {
                        return JSON.parse(e);
                    });
                    return callback(err, data);
                });
            });
        }else {
            callback();
        }
    }, "cache");
};