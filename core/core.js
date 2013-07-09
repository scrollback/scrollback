//exports.room = require("./room/room.js");
//exports.user = require("./user/user.js");
//exports.post = require("./post/post.js");
"use strict";

var config = require('../config.js');
var message = require('./api/message.js');
var db = require('mysql').createConnection(config.mysql);
var rooms = {}, gateways;
var log = require("../lib/logger.js");

exports.init = function (gw){
	gateways = gw;
};

exports.message = function(m) {
	message(m, gateways);
};

exports.messages = require("./api/messages.js");