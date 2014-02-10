var log = require("../lib/logger.js");
//var config = require('../../config.js');
var redisProxy = require('../lib/redisProxy.js');

module.exports = function(core) {
    core.on("back", function(data, cb){
        redisProxy.set("room:{{"+data.to+"}}", data.room);
        redisProxy.set("user:{{"+data.from+"}}", data.user);
        redisProxy.sadd("room:{{"+data.to+"}}:hasOccupant", data.from);
        redisProxy.sadd("user:{{"+data.from+"}}:occupantOf", data.to);
        cb();
    }, "storage");

    core.on("away", function(action, callback) {
        redisProxy.srem("room:{{"+action.to+"}}:hasOccupant", action.from, function() {
            redisProxy.scard("room:{{"+action.to+"}}:hasOccupant", function(err, data) {
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
    });

    core.on("init", function(action, callback) {
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
    });
    core.on("user", function(user, callback) {
        redisProxy.set("user:{{"+user.id+"}}", user);
    });
    core.on("room", function(room, callback) {
        redisProxy.set("room:{{"+room.id+"}}", room);
    });

    core.on("getUsers", function(query, callback) {
        if(query.id){
            return redisProxy.get("user:{{"+query.id+"}}", function(err, data) {
                return callback(err, data);
            });
        }
        if(query.occupantOf){
            return redisProxy.smembers("room:{{"+query.occupantOf+"}}:hasOccupants", function(err, data) {
                if(err) return callback(err);
                data = data.map(function(e){
                    return "user:{{"+e+"}}";
                });
                redisProxy.mget(data, function(err, data) {
                    return callback(err, data);
                });
            });
        }
    });
    core.on("getRooms", function(query, callback) {
        if(query.id){
            return redisProxy.get("room:{{"+query.id+"}}", function(err, data) {
                return callback(err, data);
            });
        }
        if(query.hasOccupants){
            return redisProxy.smembers("user:{{"+query.occupantOf+"}}:occupantOf", function(err, data) {
                if(err) return callback(err);
                data = data.map(function(e){
                    return "room:{{"+e+"}}";
                })
                redisProxy.mget(data, function(err, data) {
                    return callback(err, data);
                });
            });
        }
    });
    // require("./occupants/occupants.js")(core);
    // require("./guestinitializer/guestinitializer.js")(core);
};