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
        var user = tabs.user;
                
        var div = $('<div>').addClass('list-view list-view-email-settings');
        
        if(!user.params.email) user.params.email = {};
        if(user.params.email.notifications === undefined) user.params.email.notifications = true;
        
        div.append(formField("Mention notifications via email", "toggle", "mention", user.params.email.notifications));
        
        switch(user.params.email.frequency){
            case 'daily':
                div.append(formField("Email digest frequency", 'radio', 'email-freq',[["email-freq-daily", "Daily", "checked"], ["email-freq-never", "Never"]]));
                break;
            case 'never':
                div.append(formField("Email digest frequency", 'radio', 'email-freq', [["email-freq-daily", "Daily"], ["email-freq-never", "Never", "checked"]]));
                break;
            default:
                div.append(formField("Email digest frequency", 'radio', 'email-freq', [["email-freq-daily", "Daily", "checked"], ["email-freq-never", "Never"]]));
        }

	tabs.email = {
		html: div,
		text: "Email",
		prio: 900
	};

	next();
});

libsb.on('pref-save', function(user, next){
	user.params.email = {
            frequency : $('input:radio[name="email-freq"]:checked').next().text().toLowerCase(),
            notifications : $('#mention').is(':checked')
	};
	next();
});
