//general settings
libsb.on('pref-show', function(conf, next){
	conf.profile = {
		html: "<div class='list-view list-view-profile-settings'>" + formField("About me", "area", "about-me") + " </div>",
		text: "Profile",
		prio: 1000
	}
	next();
});

libsb.on('pref-save', function(conf, next){
	var about = $('#about-me').val();
	conf.aboutMe = about;
	next();
});


// email settings
/*
 - Email digest frequency (Daily/Weekly, Never)
 - Email me when I'm mentioned in a room (On/Off)
*/
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

//notifications settings
libsb.on('pref-show', function(conf, next){
	conf.sound = {
		html: "<div class='list-view list-view-sound-settings'> " + formField('Sound Notification ', 'toggle', 'sound-notifcation') + formField('Desktop Notification ', 'toggle', 'desktop-notification') + " </div>",
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

