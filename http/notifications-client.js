/* jshint browser: true */
/* global $, libsb, lace */

//notifications settings
var formField = require("../lib/formField.js");

libsb.on('pref-show', function(tabs, next){
    if(results.params && results.params.notifications){
        var div = $('<div>').addClass('list-view list-view-notification-settings');

        if(!results.params.notifications.sound)results.params.notifications.sound = false;
        if(!results.params.notifications.desktop)results.params.notifications.desktop = false;
        
        div.append(formField('Sound notifications ', 'toggle', 'sound-notification', results.params.notifications.sound));

        if(lace.notify.support()){
                // show desktop notifications settings, only if it is supported.
                div.append(formField('Desktop notifications ', 'toggle', 'desktop-notification', results.params.notifications.desktop));
        }
        tabs.notification = {
            html: div,
            text: "Notifications",
            prio: 800
        };

    }
    next();

});

libsb.on('pref-save', function(conf, next){
	conf.notifications = {
		sound: $('#sound-notification').is(':checked'),
		desktop: $('#desktop-notification').is(':checked')
	};
	next();
});
