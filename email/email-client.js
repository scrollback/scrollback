/* jshint browser: true */
/* global $, libsb */

/*
 - Email digest frequency (Daily/Weekly, Never)
 - Email me when I'm mentioned in a room (On/Off)
*/


// formField("Languages", "checks", [["zh", "Block chinese swear words"], ["en", "es"]);

var formField = require('../lib/formField.js');
var div = $('<div>').addClass('list-view list-view-email-settings');
// ["email-freq", "weekly"],
div.append(formField("Email digest frequency", 'radio', [["email-freq", "Daily", "checked"], ["email-freq", "Never"]], ["email-freq"]));
div.append(formField("Mention notifications via email", "toggle", "mention", true));

libsb.on('pref-show', function(conf, next){
	conf.email = {
		html: div,
		text: "Email",
		prio: 900
	};

	next();
});

libsb.on('pref-save', function(conf, next){
	conf.email = {
		frequency : $('input:radio[name="email-freq"]:checked').next().text(),
		notifications : $('#mention').is(':checked')
	};

	next();
});
