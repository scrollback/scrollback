var http = require('http');
var log = require('../lib/logger.js');
var SbError = require('../lib/SbError.js');
var config = require('../myConfig.js');

module.exports = function (payload, registrationIds) {
	if (!registrationIds instanceof Array) {
		log.e("registrationIds has to be an Array of device Registration ID(s). ");
		throw new SbError("ERR_INVALID_PARAMS", {source: 'push-notification/notify.js'});
	}
	
	var pushData = {
		data : payload,
		registrationIds: registrationIds
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
	
	var postReq = http.request(postOptions, function (res) {
		res.setEncoding('utf8');
		res.on('data', function (data) {
			data = JSON.parse(data);
			if (data.success) {
				log.i("Push Notification successful", data);
			} else {
				log.w("Push Notification unsuccessful", data);
			}
		});
	});
	
	postReq.write(JSON.stringify(pushData));
	postReq.end();
};