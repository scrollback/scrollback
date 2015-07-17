"use strict";

var log = require('../lib/logger.js'),
	request = require('request');

/*
	payload :
	{
		title : "Push Notification Title",
		message: "Message of Notification",
		"foo": "baz"
	}
*/

module.exports = function(notesForApps, payload, core, config) {
	
	function removeDevice(userObj, packageName) {
		var uuidToRemove, devices, uuid;
		log.i("REMOVE device called with", userRegMap);
		if (!(
			'params' in userObj &&
			'pushNotifications' in userObj.params &&
			'devices' in userObj.params.pushNotifications
		)) return;
		
		devices = userObj.params.pushNotifications.devices;
		for(uuid in devices) {
			if(devices[uuid].packageName === packageName) {
				uuidToRemove = uuid;
				break;
			}
		}

		if (uuidToRemove) {
			delete userRegMap.user.params.pushNotifications.devices[uuidToRemove];
			log.i("EMITTING user", JSON.stringify(userRegMap.user));

			core.emit('user', {
				type: "user",
				to: userRegMap.user.id,
				user: userRegMap.user,
				session: "internal-push-notification"
			}, function(err, data) {
				log.i("Emitter user-up ", err, JSON.stringify(data));
			});
		}
	}

	Object.keys(config.keys).forEach(function(packageName) {
		var headers = {
			'Content-Type': 'application/json',
			'Authorization': keys[packageName]
		};

		var userRegMapping = notesForApps[packageName];
		var registrationIds = Object.keys(userRegMapping), registrationIdsSubSet;

		while (registrationIds.length > 0) {
			registrationIdsSubSet = registrationIds.splice(0, 1000);
			request.post({
				uri: 'https://android.googleapis.com/gcm/send',
				headers: headers,
				body: JSON.stringify({
					data:payload,
					registration_ids: registrationIdsSubSet
				})
			}, function(err, res, body) {
				try {
					log.i("GCM request made, body", body);
					body = JSON.parse(body);
					if (body.failure) {
						for (index = 0; index < body.results.length; index++) {
							result = body.results[index];
							if (result.hasOwnProperty('error') &&
								(result.error === "InvalidRegistration" ||
								 result.error === "NotRegistered") || result.error === "MismatchSenderId") {
								removeDevice(userRegMapping[index], packageName);
							}
						}
					}
				} catch (e) {
					log.i("Error parsing GCM response");
				}
				console.log("Response status code", res.statusCode);
			});
		}		
	});
};
