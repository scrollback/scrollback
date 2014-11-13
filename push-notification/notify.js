var http = require('http');
var log = require('../lib/logger.js');
var SbError = require('../lib/SbError.js');
var config = require('../myConfig.js');
var internalSession = Object.keys(config.whitelists)[0];

var c;
/*
	payload : 
	{
		title : "Push Notification Title,
		message: "Message of Notification",
		"foo": "baz"
	}
*/

function unregisterDevice(user, registrationId) {
	if (
		typeof user === "undefined" ||
		typeof registrationId === "undefined" ||
		typeof c === "undefined"
	) return;
	
	log.i("Unregistering device ", registrationId, "for user", JSON.stringify(user));
	
	var devices = user.params && user.params.pushNotifications &&
		user.params.pushNotifications.devices ? user.params.pushNotifications.devices : [];

	user.params.pushNotifications.devices = devices.filter(function(device) {
		return device.registrationId !== registrationId;
	});

	c.emit('user', {
		user: user,
		session: internalSession
	});
}

module.exports = function(payload, registrationId, user, core) {
	c = core;
	if (typeof registrationId !== "string") {
		log.e("registrationId has to be a String. ");
		throw new SbError("ERR_INVALID_PARAMS", {
			source: 'push-notification/notify.js'
		});
	}

	var pushData = {
		data: payload,
		registration_ids: [registrationId]
	};

	var postOptions = {
		host: 'android.googleapis.com',
		port: 80,
		path: '/gcm/send',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': config.pushNotification.key
		}
	};

	var postReq = http.request(postOptions, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(data) {
			log.i("Push notification made ", data);
			try {
				data = JSON.parse(data);
				if (data && data.failure) {
					log.i("Push notification failed ", JSON.stringify(data));
					if (data.results && data.results[0] &&
						data.results[0].error === "NotRegistered") {
						// remove device from list of devices.
						unregisterDevice(user, registrationId);
					}
				}
			} catch (e) {
				log.i("GCM response parse error", e);
			}
		});
	});

	postReq.write(JSON.stringify(pushData));
	postReq.end();
};