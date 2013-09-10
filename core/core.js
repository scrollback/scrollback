"use strict";

var config = require('../config.js');
var message = require('./api/message.js');


var rooms = {};
var log = require("../lib/logger.js");

var core = Object.create(require("../lib/emitter.js"));

core.gateways = require("./gateways.js");

core.message = function(m, cb) {
	core.emit("message", m, function(err) {
		if(err) {
			console.log("Message rejected", err);
			return cb(err);
		}
		message(m, cb);
	});
};

core.room = require('./api/room.js');
core.rooms = require('./api/rooms.js');
core.account = require('./api/account.js');
core.messages = require("./api/messages.js");

module.exports = core;




