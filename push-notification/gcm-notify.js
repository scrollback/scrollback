var log = require('../lib/logger.js');
var _ = require('underscore');
var request = require('request');

/*
	payload : 
	{
		title : "Push Notification Title,
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
		var uuidToRemove, uuids;
		/*
			Removes a device from the list of the user's devices.
		*/
		if (!userRegMap.hasOwnProperty('registrationId') || !userRegMap.hasOwnProperty('user')) return;
		log.i("REMOVE device called with", userRegMap);
		var regId = userRegMap.registrationId;
		var userObj = userRegMap.user;
		if (userObj.params && userObj.params.pushNotifications && userObj.params.pushNotifications.devices) {
			var devices = userObj.params.pushNotifications.devices;
			
			uuids = Object.keys(devices);
			
			uuids.forEach(function(uuid) {
				if(devices[uuid].registrationId !== regId) return;
				uuidToRemove = uuid;
			});
		}
		
		
		if (uuidToRemove) {
			delete userObj.params.pushNotifications.devices[uuidToRemove];
			// emit user-up for userObj
			log.i("EMITTING user", JSON.stringify(userObj));

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

	function postData(notifArr) {
		/* make a HTTP Post request to the GCM servers */
		var pushData = {
			data: payload,
			registration_ids: notifArr
		};
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


	while (registrationIds.length > 0) {
		notifyArr = registrationIds.splice(0, 1000);
		postData(notifyArr);
	}
};
