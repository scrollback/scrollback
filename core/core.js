//exports.room = require("./room/room.js");
//exports.user = require("./user/user.js");
//exports.post = require("./post/post.js");

var config = require('../config.js');
var core_message = require('./core/core-message.js');
var core_messages = require('./core/core-messages.js');
var db = require('mysql').createConnection(config.mysql);
var rooms = {}, gateways;

function restartDb(err) {
	if(err) {
		db.on('error', function() {}); // Don't crash.
		console.log("DB Connection Error:", err);
	}
	console.log("Restarting Mysql connection");
	db = require('mysql').createConnection(config.mysql);
	db.on('close', restartDb);
}

db.on('end', restartDb);

exports.init = function (gw){
	gateways = gw;
};

exports.message = function(message) {
	core_message.message(message, gateways);
};

exports.messages = function(options, callback) {
	core_messages.messages(options, callback);
};