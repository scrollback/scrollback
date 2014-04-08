var config = require("../config.js");
var log = require("../lib/logger.js");
//var config = require('../../config.js');
var occupantDB = require('../lib/redisProxy.js').select(config.redis.occupants);
var userDB = require('../lib/redisProxy.js').select(config.redis.user);
var core;

module.exports = function(c) {
    core = c;
    require("./user.js")(core);
    require("./session.js")(core);
    core.on("back", onBack, "storage");
    core.on("away", onAway, "storage");
    core.on("room", onRoom, "storage");
    core.on("getRooms", onGetRooms, "cache");
};

function onBack(data, cb) {
    occupantDB.sadd("room:{{"+data.to+"}}:hasOccupants", data.from);
    occupantDB.sadd("user:{{"+data.from+"}}:occupantOf", data.to);
    cb();
}

function onAway(action, callback) {
    occupantDB.srem("room:{{"+action.to+"}}:hasOccupants", action.from, function() {
        occupantDB.scard("room:{{"+action.to+"}}:hasOccupants", function(err, data) {
            if(data==0) {
                userDB.del("room:{{"+action.to+"}}");
            }
        });
    });
    occupantDB.srem("user:{{"+action.from+"}}:occupantOf", action.to, function() {
        occupantDB.scard("user:{{"+action.from+"}}:occupantOf", function(err, data) {
            if(data==0) {
                userDB.del("user:{{"+action.from+"}}");
            }
        });
    });
    callback();
}

function onRoom(room, callback) {
    occupantDB.set("room:{{"+room.id+"}}", JSON.stringify(room));
    callback();
}



function onGetRooms(query, callback) {
    if(query.id) {
        return occupantDB.get("room:{{"+query.id+"}}", function(err, data) {
            if(err || !data) callback();
            if(data) return callback(true, [JSON.parse(data)]);
        });
    }
    if(query.hasOccupants) {
        return occupantDB.smembers("user:{{"+query.occupantOf+"}}:occupantOf", function(err, data) {
            if(err) return callback(err);
            data = data.map(function(e){
                return "room:{{"+e+"}}";
            })
            occupantDB.mget(data, function(err, data) {
                data = data.map(function(e) {
                    return JSON.parse(e);
                });
                return callback(err, data);
            });
        });
    }else {
        callback();
    }
}