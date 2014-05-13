//user profile settings
libsb.on('pref-show', function(conf, next){
	conf.profile = {
		html: "<div class='pane pane-profile-settings'>" + formField("About me", "area", "about-me") + " </div>",
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