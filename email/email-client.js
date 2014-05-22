/*
 - Email digest frequency (Daily/Weekly, Never)
 - Email me when I'm mentioned in a room (On/Off)
*/
var formField = require('../lib/formField.js');
var div = $('<div>').addClass('list-view list-view-email-settings');
div.append(formField("Email digest frequency", 'radio', [["email-freq", "daily", "checked"],["email-freq", "weekly"],["email-freq", "never"]]));
div.append(formField("Notify me via email when I am mentioned in chat ", "toggle", 'mention'));

libsb.on('pref-show', function(conf, next){
	conf.email = {
		html: div,
		text: "Email",
		prio: 900
	}
	next();
});

libsb.on('pref-save', function(conf, next){
	conf.email = {
		frequency : $('input:radio[name="email-freq"]:checked').next().text(),
		notifications : $('#mention').is(':checked')
	}
	next();
});
