/* jshint browser: true */
/* global $, libsb */

/*
 - Email digest frequency (Daily/Weekly, Never)
 - Email me when I'm mentioned in a room (On/Off)
*/


// formField("Languages", "checks", [["zh", "Block chinese swear words"], ["en", "es"]);

var formField = require('../lib/formField.js');

libsb.on('pref-show', function(tabs, next){
        //email
        var results = tabs.user;
                
        if(results.params && results.params.email){
            var div = $('<div>').addClass('list-view list-view-email-settings');
            if(!results.params.email.notifications) results.params.email.notifications = true;
            div.append(formField("Mention notifications via email", "toggle", "mention", results.params.email.notifications));
            var radio = {"daily": 0, "weekly": 1, "never": 2};
            switch(results.params.email.frequency){
                case 'daily':
                    div.append(formField("Email digest frequency", 'radio', [["email-freq", "Daily", "checked"], ["email-freq", "Never"]], ["email-freq"]));
                    break;
                case 'never':
                    div.append(formField("Email digest frequency", 'radio', [["email-freq", "Daily"], ["email-freq", "Never", "checked"]], ["email-freq"]));
                    break;
                default: 
                    div.append(formField("Email digest frequency", 'radio', [["email-freq", "Daily", "checked"], ["email-freq", "Never"]], ["email-freq"]));
            }
        }

	tabs.email = {
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
