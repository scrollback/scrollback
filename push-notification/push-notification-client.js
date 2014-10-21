/* jshint browser:true */
/* global libsb, device */

/*
	devices : [{deviceName: device.name, registrationId: registrationId, enabled: true}]
*/

document.addEventListener('deviceready', registerPushNotification, false);

var pushNotification, regId;

window.onNotificationGCM = function (e) {
	// handler for push notifications.
	console.log("Got notification", e.event);

	switch (e.event) {
	case 'registered':
		if (e.regid.length > 0) {
			// Storing regId to be used by GCM to make push notifications.
			console.log("regID = " + e.regid);
			localStorage.phonegapRegId = e.regid;
			console.log("Stored regid to localStorage ", localStorage.phonegapRegId);
		}
		break;

	case 'message':
		console.log(e);
		// e.foreground is true if the notification came in when the user is in the foreground.
		if (e.foreground) {
			console.log(e.payload.message);
		} else {
			if (e.coldstart) {
				var thread = e.payload.text.threads && e.payload.text.threads[0] ? e.payload.text.threads[0] : "";
				var state = {
					roomName: e.payload.text.to,
					mode: 'normal'
				};

				if (thread !== "") {
					state.thread = thread.id;
				}
				console.log("State object for navigate ", state);
				libsb.emit('navigate', state);
			} else {
				console.log(" ********* background notification ");
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

function registerPushNotification() {
	pushNotification = window.plugins && window.plugins.pushNotification;
	if (!pushNotification) {
		return;
	}

	if (device.platform == 'android' || device.platform == 'Android') {
		console.log('device ready; android ' + device.platform + " " + pushNotification);
		pushNotification.register(successHandler, errorHandler, {
			"senderID": "73969137499",
			"ecb": "onNotificationGCM"
		});
	}
}

// result contains any message sent from the plugin call
function successHandler(result) {
	console.log('registration success result = ' + result);
	regId = localStorage.phonegapRegId;
	mapDevicetoUser(regId);
}

// result contains any error description text returned from the plugin call
function errorHandler(error) {
	console.log('registration error = ' + error);
}

libsb.on('init-dn', function () {
	mapDevicetoUser(localStorage.phonegapRegId);
}, 100);

function mapDevicetoUser(regId) {
	if (typeof regId === "undefined") return;
	/* Checks if device is registered to User for push notification, if not adds it */
	libsb.emit("getUsers", {
		ref: "me"
	}, function (e, d) {
		var user = d.results[0];
		if (typeof user === "undefined") return;
		var deviceRegistered = false;
		if (user && typeof user.params.pushNotifications === "undefined") {
			user.params.pushNotifications = {
				devices: []
			};
		}

		var devices = [];

		devices = user && user.params.pushNotifications &&
			user.params.pushNotifications.devices ? user.params.pushNotifications.devices : devices;

		devices.forEach(function (device) {
			if (device && device.hasOwnProperty('registrationId')) {
				if (device.registrationId === regId) {
					deviceRegistered = true;
				}
			}
		});
		var newDevice = {
			deviceName: device.model,
			registrationId: regId,
			enabled: true
		};
		if (deviceRegistered === false) {
			devices.push(newDevice);
			user.params.pushNotifications.devices = devices;
			libsb.emit('user-up', {
				user: user
			});
		}
	});
}

libsb.on('pref-save', function (user, next) {
	libsb.emit("getUsers", {
		ref: "me"
	}, function (e, d) {
		var params = d.results[0].params;
		if (params && params.hasOwnProperty('pushNotifications')) {
			user.params.pushNotifications = params.pushNotifications;
		} else {
			user.params.pushNotifications = {
				devices: []
			};
		}
		next();
	});
}, 500);