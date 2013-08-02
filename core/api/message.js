"use strict";

var config = require('../../config.js');
var db = require('../data.js'),
	guid = require('../../lib/guid.js');
var log = require("../../lib/logger.js");
var gateways = require("../gateways.js");
var abuse = require("../../plugins/abuse/abuse.js");

abuse.init();

module.exports = function(message, gateways, cb) {
	if (!message.id) message.id = guid();
	if (!message.time) message.time = new Date().getTime();
	if(abuse.rejectable(message)) {
		if(cb) cb(false,{err:"ERR_ABUSE"});
		return;
	}

    db.query("INSERT INTO `messages` SET `id`=?, `from`=?, `to`=?, `type`=?, `text`=?, "+
        "`origin`=?, `time`=?, `ref`=?", [message.id, message.from, message.to, message.type, 
        message.text, message.origin, message.time, message.ref]);
	
    gateways.http.send(message, [message.to]);

    db.query("SELECT * FROM `accounts` WHERE `room`=?", [message.to],
        function(err, data) {
            var i, l, name, list = {};
            if(err) console.log("Can't get list of rooms");
            for(i=0, l=data.length; i<l; i+=1) {
                name = data[i].id.split(':')[0];
                if(!list[name]) list[name] = [];
                list[name].push(data[i].id);
            }
            for(name in list) {
                if(gateways[name] && gateways[name].send)
                    gateways[name].send(message, list[name]);
            }
        }
	);
};
