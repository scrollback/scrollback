//notifications settings
var formField = require("../lib/formField.js");

libsb.on('pref-show', function(conf, next){
	conf.sound = {
		html: "<div class='list-view list-view-sound-settings'> " + formField('Sound Notification ', 'toggle', 'sound-notifcation') + formField('Desktop Notification ', 'toggle', 'desktop-notification') + " </div>",
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
