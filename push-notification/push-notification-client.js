/* jshint browser:true */
/* global libsb, device */

/*
	devices : [{deviceName: device.name, registrationId: registrationId, enabled: true}]
*/

var config = require('../client-config-defaults.js');
var pushNotification, regId;
var userObj, registrationID;

libsb.on('init-dn', registerPushNotification, 500);

libsb.on('logout', unregisterPushNotification, 500);

window.onNotificationGCM = function(e) {
	// handler for push notifications.
	switch (e.event) {
		case 'registered':
			if (e.regid.length > 0) {
				// Storing regId to be used by GCM to make push notifications.
				console.log("regID = " + e.regid);
				localStorage.phonegapRegId = e.regid;
			}
			break;

		case 'message':
			console.log(e);
			// creating the state object.
			var thread = e.payload.threadId;
			var state = {
				roomName: e.payload.roomName,
				mode: 'normal'
			};

			if (thread !== "") {
				state.thread = thread.id;
			}
			// e.foreground is true if the notification came in when the user is in the foreground.
			if (e.foreground) {
				console.log("In foreground ", e.payload.message);
				// TODO: Add a lace notification here, if the new new message is not in view. Clicking on this notification 
				// 		 should navigate user to the message.
				/*var $notif = $('<div>').html(e.payload.title + "<a class='pushnotif-navigate'>Click here to view it.</a>").alertbar();
			$notif.find('.pushnotif-navigate').click(function (){
				libsb.emit("navigate", state);
			});*/
			} else {
				if (e.coldstart) {
					setTimeout(function() {
						libsb.emit('navigate', state);
					});
				} else {
					//background notification
					setTimeout(function() {
						libsb.emit('navigate', state);
					});
				}
			}
			break;

		case 'error':
			console.log(e.msg);
			break;

		default:
			console.log(e);
			break;
	}
};

function registerPushNotification(init, next) {
	var user = init.user || libsb.user;
	if (/^guest-/.test(user.id)) return next(); //don't register users for pushNotifications, if they are not logged in.
	
	pushNotification = window.plugins && window.plugins.pushNotification;
	if (!pushNotification || typeof device === "undefined") {
		return next();
	}

	if (device.platform == 'android' || device.platform == 'Android') {
		console.log('device ready; android ' + device.platform + " " + pushNotification);
		pushNotification.register(registerSuccessHandler, errorHandler, {
			"senderID": config.pushNotification.gcm.senderID,
			"ecb": "onNotificationGCM"
		});
	}
	return next();
}

function unregisterPushNotification(l, n) {
	pushNotification = window.plugins && window.plugins.pushNotification;
	if (!pushNotification) return n();
	userObj = libsb.user; // userObj is needed inside unregisterSuccesHandler, which is an async function.
	registrationID = localStorage.phonegapRegId;
	pushNotification.unregister(unregisterSuccessHandler, errorHandler, {
		"senderID": config.pushNotification.gcm.senderID
	});
	n();
}

// result contains any message sent from the plugin call
function registerSuccessHandler(result) {
	console.log('registration success result = ' + result);
	regId = localStorage.phonegapRegId;
	mapDevicetoUser(regId);
}

function unregisterSuccessHandler(result) {
	console.log('unregistration success result = ' + result);
	delete localStorage.phonegapRegId;
}

function errorHandler(error) {
	console.log('registration/unreg error = ' + error);
}

libsb.on('init-dn', function(init, next) {
	mapDevicetoUser(localStorage.phonegapRegId);
	next();
}, 100);

function mapDevicetoUser(regId) {
	if (typeof device === "undefined") return;
	var user = libsb.user;
	if (typeof regId === "undefined" || typeof user === "undefined") return;
	if (!window.plugins || !window.plugins.uniqueDeviceID) return;

	/* Checks if device is registered to User for push notification, if not adds it */

	if (user && typeof user.params.pushNotifications === "undefined") {
		libsb.user.params.pushNotifications = {
			devices: []
		};
	}

	window.plugins.uniqueDeviceID.get(function(uuid) {
		var thisDevice = {
			deviceName: device.model,
			type: 'GCM',
			registrationId: regId,
			uuid: uuid,
			enabled: true
		};

		var devices = user && user.params.pushNotifications &&
			user.params.pushNotifications.devices ? user.params.pushNotifications.devices : [];
		
		// if device does not have a uuid, remove it; also remove it if it already exists in the list.
		devices = devices.filter(function(d) {
			return d.hasOwnProperty('uuid') && d.uuid !== thisDevice.uuid;
		});
		 
        devices.push(thisDevice);
        user.params.pushNotifications.devices = devices;
        libsb.emit('user-up', {
            user: user
        });
		
	});
}

libsb.on('pref-save', function(user, next) {
	var params = libsb.user.params;
	if (params && params.hasOwnProperty('pushNotifications')) {
		user.params.pushNotifications = params.pushNotifications;
	} else {
		user.params.pushNotifications = {
			devices: []
		};
	}
	next();
}, 500);