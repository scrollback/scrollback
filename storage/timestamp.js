"use strict";

var redis;
var locks = {};



module.exports = function (core, config) {
	redis = require('redis').createClient();
	redis.select(config.redisDB);
	core.on("edit", function(edit, callback) {
		if (!edit.updateTime) edit.updateTime = new Date().getTime();
		makeTimeUnique(edit, "updateTime", callback);
	}, "validation");
	core.on("text", function(text, callback) {
		if (!text.time) text.time = new Date().getTime();
		makeTimeUnique(text, "time", callback);
	}, "validation");
};


function makeTimeUnique(action, propertyName, callback) {
	function saveTimestamp(time) {
		locks[action.to] = true;
		redis.set("lastTimeStamp:" + action.to, time, function() {
			locks[action.to] = false;
			callback();
		});
	}
	if (!locks[action.to]) {
		redis.get("lastTimeStamp:" + action.to, function(err, timestamp) {
			if (timestamp) timestamp = parseInt(timestamp);
			else timestamp = 1;
			if (action.time > timestamp) {
				saveTimestamp(action[propertyName]);
			} else {
				action[propertyName] = timestamp + 1;
				saveTimestamp(action[propertyName]);
			}
		});
	} else {
		setTimeout(function() {
			makeTimeUnique(action, propertyName, callback);
		}, 1);
	}
}
