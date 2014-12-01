var config = require('../server-config-defaults.js'),
	redis = require('../lib/redisProxy.js').select(config.redisDB.threader),
	log = require("../lib/logger.js");

module.exports = function(message, callback) {
	return function () {
		var isNewThread = addThread(message);
		addLabel(message);
		if (message.labels.startOfThread && isNewThread) {
			atomicIncAndGet(message, function(color) {
				message.threads[0].id = message.threads[0].id + color;
				callback();
			});
		} else callback();
	};
};


function atomicIncAndGet(message, callback) {
	redis.incr("threader:" + message.to + ":color", function(err, num) {
		var c = parseInt(num);
		var color = (c - 1) % 10;
		callback(color);
		if (c >= (100000000)) {
			log("Number of threads exceeded 10^8");
			redis.decrby("threader:" + message.to + ":color", 100000000);
		}
	});

}

function addLabel(message) {
	if (message.threads[0] && message.threads[0].id.indexOf(message.id) === 0) {
		message.labels.startOfThread = 1;
		message.threads[0].title = message.text;
	}
}

function addThread(message) {
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
		message.threads.push({id: message.id, score: 1, title: message.text});
	}
	return flag;
}
