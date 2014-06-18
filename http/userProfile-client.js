/* jshint browser: true */
/* global $, libsb */

//user profile settings
var formField = require("../lib/formField.js");
libsb.on('pref-show', function(tabs, next){
    var $div = $('<div>').append(formField("About me", "area", "about-me", tabs.user.description));

    tabs.profile = {
        text: "Profile",
            html: $div,
            prio: 1000
    };
    next();
});

libsb.on('pref-save', function(user, next){
	var about = $('#about-me').val();
	user.description = about;
    user.identities = libsb.user.identities;

	next();
});
