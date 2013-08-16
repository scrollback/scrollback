//exports.room = require("./room/room.js");
//exports.user = require("./user/user.js");
//exports.post = require("./post/post.js");
"use strict";

var config = require('../config.js');
var message = require('./api/message.js');


var rooms = {};
var log = require("../lib/logger.js");

exports.gateways = require("./gateways.js");

exports.message = function(m, cb) {
	message(m, gateways, cb);
};



exports.room = require('./api/room.js');
exports.account = require('./api/account.js');
exports.messages = require("./api/messages.js");