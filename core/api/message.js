"use strict";

var config = require('../../config.js');
var db = require('../data.js'),
guid = require('../../lib/guid.js');
var log = require("../../lib/logger.js");
var gateways = require("../gateways.js");
var dbName;

module.exports = function(message, callback) {
	if (!message.id) message.id = guid();
	if (!message.time) message.time = new Date().getTime();
	
	if(typeof message.to === 'string') message.to = [message.to];

	if(typeof message.labels === 'string') message.labels = [message.labels];
	else if(!message.labels || message.labels.length == 0) message.labels = [ "" ];

	if(message.type) dbName = message.type + "_messages"  ;

	// TODO: Rewrite this to use a single INSERT query.db.
	message.to.forEach(function(to) {
		db.query("INSERT INTO `" + dbName + "` SET `id`=?, `from`=?, `to`=?, `type`=?, `text`=?, "+
			"`origin`=?, `time`=?, `ref`=?, `labels`= ?", [message.id, message.from, message.to, message.type, 
			message.text,  JSON.stringify(message.origin), message.time, message.ref,message.labels[0]]);
	});
	return callback? callback(null, message): null;
};
