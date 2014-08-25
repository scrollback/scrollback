var config = require("../config.js");
//var log = require("../lib/logger.js");
//var config = require('../../config.js');
var occupantDB = require('../lib/redisProxy.js').select(config.redisDB.occupants);
var userDB = require('../lib/redisProxy.js').select(config.redisDB.user);
var roomDB = require('../lib/redisProxy.js').select(config.redisDB.room);
var core;
module.exports = function(c) {
    core = c;
    require("./user.js")(core);
    require("./session.js")(core);
    occupantDB.flushdb();   
    core.on("back", onBack, "storage");
    core.on("away", onAway, "storage");
    core.on("room", onRoom, "storage");
    core.on("getRooms", onGetRooms, "cache");
};

function onBack(data, cb) {
    roomDB.set("room:{{"+data.room.id+"}}", JSON.stringify(data.room));
    occupantDB.sadd("room:{{"+data.to+"}}:hasOccupants", data.from);
    occupantDB.sadd("user:{{"+data.from+"}}:occupantOf", data.to);
    cb();
}

function onAway(action, callback) {
    occupantDB.srem("room:{{"+action.to+"}}:hasOccupants", action.from, function() {
        if(!/^guest-/.test(action.from)) return;
        occupantDB.scard("room:{{"+action.to+"}}:hasOccupants", function(err, data) {
            if(!data) userDB.del("room:{{"+action.to+"}}");
        });
    });
    occupantDB.srem("user:{{"+action.from+"}}:occupantOf", action.to, function() {
        if(!/^guest-/.test(action.from)) return;
        occupantDB.scard("user:{{"+action.from+"}}:occupantOf", function(err, data) {
            if(!data) userDB.del("user:{{"+action.from+"}}");
        });
    });
    callback();
}

function onRoom(action, callback) {
    roomDB.set("room:{{"+action.room.id+"}}", JSON.stringify(action.room));
    callback();
}

function onGetRooms(query, callback) {
    if(query.ref && !query.hasMember) {
        return roomDB.get("room:{{"+query.ref+"}}", function(err, data) {
            var res;
            if(err || !data) return callback();
            if(data){
                try{
                    res  = JSON.parse(data);
                    query.results = [res];
                }catch(e){}
            }
            callback();
        });
    } else if(query.hasOccupant) {
        return occupantDB.smembers("user:{{"+query.hasOccupant+"}}:occupantOf", function(err, data) {
            if(err) return callback(err);
            if(!data || !data.length) {
                query.results = [];
                return callback();
            }
            data = data.map(function(e){
                return "room:{{"+e+"}}";
            });
            
            roomDB.mget(data, function(err, data) {
                if(data){
                    data = data.map(function(e) {
                        return JSON.parse(e);
                    });
                    query.results = data;    
                }else{
                    query.results = [];
                }
                
                return callback(err, data);
            });
        });
    }else {
        callback();
    }
}