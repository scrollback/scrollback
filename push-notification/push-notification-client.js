/* jshint browser:true */
/* global libsb, $ */

libsb.on('pref-show', function(tabs, next) {
	var $div = $('<div>');
	
	tabs.pushnotification = {
		text: "Your Devices",
		html: $div,
		prio: 1000
	};
	
	next();
});