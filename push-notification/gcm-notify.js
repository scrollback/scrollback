var http = require('http');
var log = require('../lib/logger.js');
var SbError = require('../lib/SbError.js');
var config = require('../myConfig.js');
var _ = require('underscore');

/*
	payload : 
	{
		title : "Push Notification Title,
		message: "Message of Notification",
		"foo": "baz"
	}
*/

module.exports = function(payload, userRegMapping) {
	if (!userRegMapping instanceof Array) {
		log.e("registrationIds has to be an Array of device Registration ID(s). ");
		throw new SbError("ERR_INVALID_PARAMS", {
			source: 'push-notification/notify.js'
		});
	}

	var registrationIds = _.pluck(userRegMapping, 'registrationId');

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
				}
			} catch (e) {
				log.i("GCM responsoe parse error", e);
			}
		});
	});

	// splice registrationIds array in elements of 1000 each (GCM limit) and notify. 
	var tmp_arr = registrationIds,
		notifyArr;
	
	function postData(notifArr) {
		var pushData = {
			data: payload,
			registration_ids: notifArr
		};

		postReq.write(JSON.stringify(pushData));
	}
	
	while (tmp_arr.length > 999) {
		notifyArr = tmp_arr.splice(0, 1000);
		postData(notifyArr);
	}
	
	if (tmp_arr.length) {
		postData(tmp_arr);
	}

	postReq.end();
};