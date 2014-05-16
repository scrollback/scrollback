/*
 - Email digest frequency (Daily/Weekly, Never)
 - Email me when I'm mentioned in a room (On/Off)
*/
var formField = require('../lib/formField.js');

libsb.on('pref-show', function(conf, next){
	conf.email = {
		html: "<div class='list-view list-view-email-settings'>" + formField("Email digest frequency", 'radio', [["email-freq", "daily", "checked"],["email-freq", "weekly"],["email-freq", "never"]]) + formField("Notify me via email when I am mentioned in chat ", "toggle", 'mention') + " </div>",
		text: "Email",
		prio: 900
	}
	next();
});

libsb.on('pref-save', function(conf, next){
	conf.email = {
		frequency : $('input:radio[name="email-freq"]:checked').next().text(),
		notifcations : $('#mention').is(':checked')
	}
	next();
});
