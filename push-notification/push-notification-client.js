/* jshint browser:true */
/* global libsb, $ */

libsb.on('pref-show', function(tabs, next) {
	var $div = $('<div>');
	var user = tabs.user;
	
	var devices = user.params.pushNotifications && 
        user.params.pushNotifications.devices ? user.params.pushNotifications.devices : [];
	/*
		Structure of user.params.pushNotifications
		
		user.params.pushNotifications = {
			devices : [ 
				{platform: "Android", deviceId: "adsfaf32r23sdf21e123", enabled: true}, 
				{platform: "iOS", deviceId: "234jkidksf9325pi23d2sdf", enabled: false}
			]
		}
	
	*/
	
	tabs.pushnotification = {
		text: "Your Devices",
		html: $div,
		prio: 1000
	};
	
	next();
});