//user profile settings
var formField = require("../lib/formField.js");
var div = $('<div>').addClass('list-view list-view-profile-settings');
div.append(formField("About me", "area", "about-me"));

libsb.on('pref-show', function(conf, next){
	conf.profile = {
		html: div,
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
