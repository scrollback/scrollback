//user profile settings
var formField = require("../lib/formField.js");

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
