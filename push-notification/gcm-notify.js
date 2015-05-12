"use strict";

var log = require('../lib/logger.js');
var _ = require('underscore');
var request = require('request');

/*
	payload :
	{
		title : "Push Notification Title",
		message: "Message of Notification",
		"foo": "baz"
	}
*/

module.exports = function(userRegMapping, payload, core, config) {
	var registrationIds = _.pluck(userRegMapping, 'registrationId'), notifyArr, index,result;

	var headers = {
		'Content-Type': 'application/json',
		'Authorization': config.key
	};

	function removeDevice(userRegMap) {
		var uuidToRemove, devices, uuid;
		log.i("REMOVE device called with", userRegMap);
		if (!(
			'registrationId ' in userRegMap &&
			'user' in userRegMap &&
			'params' in userRegMap.user &&
			'pushNotifications' in userRegMap.user.params &&
			'devices' in userRegMap.user.params.pushNotifications
		)) return;

		for(uuid in devices) {
			if(devices[uuid].redId === userRegMap.registrationId) {
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

	function postData(notifArr) {
		/* make a HTTP Post request to the GCM servers */
		var pushData = {
			data: payload,
			registration_ids: notifArr
		};
		console.log(JSON.stringify(pushData));
		console.log("headers",headers);
		request.post({
			uri: 'https://android.googleapis.com/gcm/send',
			headers: headers,
			body: JSON.stringify(pushData)
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
							removeDevice(userRegMapping[index]);
						}
					}
				}
			} catch (e) {
				log.i("Error parsing GCM response");
			}
			console.log("Response status code", res.statusCode);
		});
	}

	log.d(registrationIds);
	while (registrationIds.length > 0) {
		notifyArr = registrationIds.splice(0, 1000);
		log.d(notifyArr, payload);
		postData(notifyArr);
	}
};
