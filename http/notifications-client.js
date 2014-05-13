//notifications settings
libsb.on('pref-show', function(conf, next){
	conf.sound = {
		html: "<div class='pane pane-sound-settings'> " + formField('Sound Notification ', 'toggle', 'sound-notifcation') + formField('Desktop Notification ', 'toggle', 'desktop-notification') + " </div>",
		text: "Notications",
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