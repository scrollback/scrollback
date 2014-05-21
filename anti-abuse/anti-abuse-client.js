var formField = require("../lib/formField.js");

var div = $('<div>').addClass('list-view list-view-spam-settings');
div.append(formField("Block offensive words", "toggle", 'block-offensive'));

libsb.on('config-show', function(conf, next) {
	conf.spam = {
		html: div,
		text: "Spam control",
		prio: 600
	};

	next();
});

libsb.on('config-save', function(conf, next){
	conf.spam = {
		offensive : $('#block-offensive').is(':checked')
	};

	next();
});
