//notifications settings
var formField = require("../lib/formField.js");

libsb.on('pref-show', function(conf, next){
	conf.notification = {
		html: "<div class='list-view list-view-notification-settings'> " + formField('Sound notifications ', 'toggle', 'sound-notifcation') + formField('Desktop notifications ', 'toggle', 'desktop-notification') + " </div>",
		text: "Notifications",
		prio: 800
	}
	next();
});

libsb.on('pref-save', function(conf, next){
	conf.notifications = {
		sound: $('#sound-notifcation').is(':checked'),
		desktop: $('#desktop-notification').is(':checked')
	}
	next();
});
