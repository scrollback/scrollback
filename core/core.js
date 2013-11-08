"use strict";

var config = require('../config.js');
var redisProxy = require('./redisProxy.js');
var message = require('./api/message.js');
var room = require('./api/room.js');
//var user = require('./api/user.js');
var plugins = {};

var rooms = {} , users = {};
var log = require("../lib/logger.js");

var core = Object.create(require("../lib/emitter.js"));

core.message = function(m, cb) {
	core.emit("message", m, function(err) {
		if(err) {
			log("Message rejected", err);
			return cb? cb(err,m): null;
		}
		if (m.user && m.type=="nick") {
			m.ref=m.user.id;
		}
		message(m, cb);
	});
};

core.room = function(o, cb) {
	console.log( o , typeof o);
	if(typeof o === 'string') {
		return room(o, cb);
	} else if (o.id) {
		room(o.id, function(err, oldRoom) {
			if(err) oldRoom = null;
			o.old = oldRoom;
			//need to delete the IRC ACCOUNTS
			o.originalId = o.id;
			core.emit('room', o, function(err) {
				if(err) {
					log("Room update rejected", err);
					return cb? cb(err, o): null;
				}
				delete o.old;
				room(o, cb);
			});
		});
	}
	
}
/*
core.user = function(o ,cb){
	if(typeof o === 'string'){
		return user(o,cb);
	}
	else if (o.id){
		user(o.id , function(err , oldUser){
			if(err) oldUser = null;
			o.old = oldUser;
			o.originalId = o.id;
			core.emit('user' , o , function(err){
				if (err){
					log("User update rejected" , err);
					return cb? cb(err ,o):null;
				}
				delete o.old;
				user(o,cb);
			});

		});
	}
}
*/
core.rooms = require('./api/rooms.js');
//core.users = require('./api/users.js');
core.accounts = require('./api/accounts.js');
core.messages = require("./api/messages.js");

core.occupants = function(roomId, callback) {
	redisProxy.smembers(roomId, function(err, data){
		callback(err, data);
	});
};
core.setConfigUi = function(plugin, pluginConfig) {
	plugins[plugin] = pluginConfig;
	return pluginConfig;
};


core.getConfigUi = function(plugin) {
	console.log(plugin);
	if(plugins[plugin])
		return plugins[plugin];
	else
		throw new Error("Plugin Config not found");
};

module.exports = core;