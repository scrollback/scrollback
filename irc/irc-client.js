var formField = require('../lib/formField.js');

libsb.on('config-show', function(conf, next) {
	conf.irc = {
		html: "<div class='list-view list-view-irc-settings'>" + formField("IRC Server", "text", "ircserver") + formField("IRC Channel", "text", "ircchannel") + "</div>",
		text: "IRC setup",
		prio: 800
	}
	next();
});

libsb.on('config-save', function(conf, next){
	conf.irc = {
		server : $('#ircserver').val(),
		channel : $('#ircchannel').val()
	};
	next();
});
