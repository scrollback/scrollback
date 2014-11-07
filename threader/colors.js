var config = require('../config.js'),
	redis = require('../lib/redisProxy.js').select(config.redisDB.threader),
	log = require("../lib/logger.js"),
	lock = {};

module.exports = function(message, callback) {
	return function () {
		generateId(message);
		addLabel(message);
		if (message.labels.startOfThread) {
			atomicIncAndGet(message, function(color) {
				var t = message.threads[0].id;
				t = t.substring(0, t.length - 1) + color;
				message.threads[0].id = t;
				callback();
			});
		} else callback();
	}
}


function atomicIncAndGet(message, callback) {
	if (!lock[message.to]) {
		lock[message.to] = true;
		redis.get("threader:" + message.to + ":color", function(err, color) {
			var color = (color === null) ? 0 : parseInt(color);
			redis.set("threader:" + message.to + ":color", (color + 1) % 10, function(err, data) {
				delete lock[message.to];
				callback(color);
			});
		});
	} else {
		process.nextTick(function() {
			redisIncAndGet(message, callback);
		})
	}
}

function addLabel(message) {
	for (i = 0, l = message.threads.length; i < l; i++) {
		if (message.threads[i].id.indexOf(message.id) === 0) {
			message.labels.startOfThread = 1;
			break;
		}
	}
}

function generateId(message) {
	var flag = false;
	for (var i = 0;i < message.threads.length;i++) {
		var th = message.threads[i];
		if (th.id === "new") {
			flag = true;
			message.threads.splice(i, 1);
			i--;
		}
	}
	if (flag) {
		message.labels.startOfThread = 1;
		message.threads.push({id: message.id + "0", score: 1, title: message.text});
	}
}
