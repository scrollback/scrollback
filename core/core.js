"use strict";

var config = require('../config.js');
var message = require('./api/message.js');
var room = require('./api/room.js');
var plugins = {};

var rooms = {};
var log = require("../lib/logger.js");

var core = Object.create(require("../lib/emitter.js"));

core.gateways = require("./gateways.js");

core.message = function(m, cb) {
	core.emit("message", m, function(err) {
		if(err) {
			console.log("Message rejected", err);
			return cb? cb(err,m): null;
		}
		if (m.user && m.type=="nick") {
			m.ref=m.user.id;
		}
		message(m, cb);
	});
};

core.room = function(o, cb) {
	if(typeof o === 'string') {
		return room(o, cb);
	} else if (o.id) {
		room(o.id, function(err, oldRoom) {
			if(err) oldRoom = null;
			o.old = oldRoom;
			core.emit('room', o, function(err) {
				if(err) {
					console.log("Room update rejected", err);
					return cb? cb(err, o): null;
				}
				delete o.old;
				room(o, cb);
			});
		});
	}
	
}
core.rooms = require('./api/rooms.js');
core.accounts = require('./api/accounts.js');
core.messages = require("./api/messages.js");

core.setConfigUi = function(plugin, pluginConfig) {
	plugins[plugin] = pluginConfig;
	return pluginConfig;
};


core.getConfigUi = function(plugin) {
	if(plugins[plugin])
		return plugins[plugin];
	else
		throw new Error("Plugin Config not found");
};

module.exports = core;