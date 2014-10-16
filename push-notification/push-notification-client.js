/* jshint browser:true */
/* global libsb, device */

/*
	devices : [{deviceName: device.name, registrationId: true}]
*/

function mapDevicetoUser(regId) {
	/* Checks if device is registered to User for push notification, if not adds it */
	var user = libsb.user;
	var deviceRegistered = false;
	if (typeof user.params.pushNotifications === "undefined") {
		user.params.pushNotifications = {devices: []};
	}
	var devices = user.params.pushNotifications && 
		user.params.pushNotifications.devices ? user.params.pushNotifications.devcies: [];
	devices.forEach(function(device) {
		if (device && device.hasOwnProperty('registrationId')) {
			if (device.registrationId === regId) {
				deviceRegistered = true;
			}
		}
	});
	var newDevice = {deviceName: device.name};
	newDevice[regId] = true;
	if (deviceRegistered === false) {
		devices.push(newDevice);
		user.params.pushNotifications.devices = devices;
		libsb.emit('user-up', user);
	}
}

if (window.phonegap) {
	// add the device registration id to the users params.
	var regId = localStorage.phonegapRegId;
	console.log("Inside push-notification-client, reg id is ", regId);
	mapDevicetoUser(regId);
}

//libsb.on('pref-show', function(tabs, next) {
//	var $div = $('<div>');
//	var user = tabs.user;
//	
//	var devices = user.params.pushNotifications && 
//        user.params.pushNotifications.devices ? user.params.pushNotifications.devices : [];
	/*
		Structure of user.params.pushNotifications
		
		user.params.pushNotifications = {
			devices : [ 
				{platform: "Android", deviceId: "adsfaf32r23sdf21e123", enabled: true}, 
				{platform: "iOS", deviceId: "234jkidksf9325pi23d2sdf", enabled: false}
			]
		}
	
	*/
	
//	tabs.pushnotification = {
//		text: "Your Devices",
//		html: $div,
//		prio: 1000
//	};
//	
//	next();
//});