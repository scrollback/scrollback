/* jshint browser: true */
/* global $, libsb, desktopnotify */

//notifications settings
var formField = require("../lib/formField.js");

libsb.on("pref-show", function(tabs, next){
    var user = tabs.user;

    var $div = $("<div>");

    if(!user.params.notifications){
        user.params.notifications = {};
        user.params.notifications.sound = false;
        user.params.notifications.desktop = false;
    }

    $div.append(formField("Sound notifications ", "toggle", "sound-notification", user.params.notifications.sound));

    if(desktopnotify.support()){
        // show desktop notifications settings, only if it is supported.
       $div.append(formField("Desktop notifications ", "toggle", "desktop-notification", user.params.notifications.desktop));
    }

    tabs.notification = {
        text: "Notifications",
        html: $div,
        prio: 800
    };

    next();
});

libsb.on("pref-save", function(user, next){
    user.params.notifications = {
        sound: $("#sound-notification").is(":checked"),
        desktop: $("#desktop-notification").is(":checked")
	};

	next();
});
