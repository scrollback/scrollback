"use strict";

var config = require('../config.js');
var message = require('./api/message.js');


var rooms = {};
var log = require("../lib/logger.js");

var core = new (require("events").EventEmitter)();

core.gateways = require("./gateways.js");

core.message = function(m, cb) {
	core.emit("message", m);
	message(m, cb);
};

core.room = require('./api/room.js');
core.account = require('./api/account.js');
core.messages = require("./api/messages.js");

module.exports = core;