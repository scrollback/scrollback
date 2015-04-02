module.exports = function(core, config) {
	var gen = require("../lib/generate.js");
	var to;

	core.emit('init', {
		suggestedNick: "echobot",
		session: "twitter://echobot",
		to: "me",
		type: "init",
		origin: { gateway: "twitter" }
	});
	core.on('text', function(message, next) {
		var message_array=message.text.split(" ");
		to = message.to;
		if (message_array[0]==="!echobot") {
			core.emit("text", {
				id: gen.uid(),
				from: "echobot",
				to: to,
				text: message.text.slice(9, message.text.length),
				time: message.time,
				thread: message.thread,
				type: "text",
				session: "twitter://echobot"
			});
		}
		next();
	}, 300);
};

