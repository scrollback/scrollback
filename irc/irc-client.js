var formField = require('../tools/formField.js');

libsb.on('config-show', function(conf, next) {
	conf.irc = {
		html: "<div class='pane pane-irc-settings'>" + formField("IRC Server", "text", "ircserver") + formField("IRC Channel", "text", "ircchannel") + "</div>",
		text: "IRC setup",
		prio: 800
	} 
	next();
});

libsb.on('config-save', function(conf, next){
	conf.irc = {
		server : $('.pane-irc-settings #ircserver').val(),
		channel : $('.pane-irc-settings #ircchannel').val()
	};
	next();
});