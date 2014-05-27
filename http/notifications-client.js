//notifications settings
var formField = require("../lib/formField.js");
var div = $('<div>').addClass('list-view list-view-notification-settings');
div.append(formField('Sound notifications ', 'toggle', 'sound-notification'));

if(lace.notify.support()){
	// show desktop notifications settings, only if it is supported.
	div.append(formField('Desktop notifications ', 'toggle', 'desktop-notification'));
}

libsb.on('pref-show', function(conf, next){
	conf.notification = {
		html: div,
		text: "Notifications",
		prio: 800
	}
	next();
});

libsb.on('pref-save', function(conf, next){
	conf.notifications = {
		sound: $('#sound-notification').is(':checked'),
		desktop: $('#desktop-notification').is(':checked')
	}
	next();
});
