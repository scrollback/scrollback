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
			delete userObj.params.pushNotifications.devices[uuidToRemove];
			core.emit('user', {
				type: "user",
				to: userObj.id,
				user: userObj,
				session: "internal-push-notification"
			}, function(err, data) {
				log.i("Emitter user-up ", err, JSON.stringify(data));
			});
		}
	}

	Object.keys(config.keys).forEach(function(packageName) {
		var headers = {
			'Content-Type': 'application/json',
			'Authorization': config.keys[packageName]
		};

		var userRegMapping = notesForApps[packageName];
		var registrationIds = Object.keys(userRegMapping), registrationIdsSubSet;

		function doneNotify(err, res, body) {
			var index, result;
			if(err) return log.e(err);
			
			try {
				log.i("GCM request made, body", body);
				log.i("Response status code", res && res.statusCode);
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
				log.i("Error parsing GCM response", e);
			}
		}
		
		while (registrationIds.length > 0) {
			registrationIdsSubSet = registrationIds.splice(0, 1000);
			request.post({
				uri: 'https://android.googleapis.com/gcm/send',
				headers: headers,
				body: JSON.stringify({
					data:payload,
					registration_ids: registrationIdsSubSet
				})
			}, doneNotify);
		}
	});
};
