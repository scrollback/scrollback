var log = require('../lib/logger.js');
var gcm_notify = require('./gcm-notify.js');
var config = require('../config.js');
var stringUtils = require('../lib/stringUtils.js');
var internalSession = Object.keys(config.whitelists)[0];

/*
	devices : [{deviceName: device.name, registrationId: registrationId, enabled: true}]
*/

module.exports = function(core) {
	function mapUsersToIds(idList) {
		var userList = [];
		idList.forEach(function(id) {
			core.emit("getUsers", {ref: id, session: internalSession}, function(err, data) {
				if (!data || !data.results || !data.results[0]) return;
				userList.push(data.results[0]);
			});
		});
		return userList;
	}
	
	function notifyUsers(userList, payload) {
		var regList = [];
		userList.forEach(function(userObj) {
			if (userObj.params && userObj.params.pushNotifications && userObj.params.pushNotifications.devices) {
				var devices = userObj.params.pushNotifications.devices;
				devices.forEach(function(device) {
					if (device.hasOwnProperty('registrationId') && device.enabled === true) {
						regList.push({user: userObj, registrationId: device.registrationId});
					}
				});
			}
		});
		gcm_notify(regList, payload, core);
	}
	
	function makePayload(title, message, text) {
		var payload = {
			collapse_key: text.to, //for each room discard old message if not delivered
			notId: stringUtils.hashCode(text.to),
			title: title,
			message: message,
			roomName: text.to,
			time: text.time,
			threadId: text.threads[0].id
		};
		var msgLen = JSON.stringify(payload).length;
		
		if (msgLen > 4 * 1024) {
			log.e("Payload too big for push notification! ", JSON.stringify(payload));
			payload.message = payload.message.substring(0, 700);
		}
		return payload;
	}
	
	core.on('text', function(text, next) {
		var from = text.from.replace(/^guest-/, "");
		if (!text.threads || !text.threads[0]) return next();
		// push notification when user is mentioned in a text message.
		var mentions = text.mentions ? text.mentions : [];
		var title = "[" + text.to + "] " + from + " mentioned you";
		var message = "[" + from + "] " + text.text;
		var payload = makePayload(title, message, text);
		mentions.forEach(function(user) {
			notifyUserId(user, payload);
		});


		// push notification on new thread creation.
		if (text.labels && text.labels.manualThreaded === 1 && 
			text.labels.startOfThread && text.threads[0]) {
			title = "[" + text.to + "] " + "new discussion";
			message =  "[" + from + "] " + text.text;
			payload = makePayload(title, message, text);
			core.emit("getUsers", {
				memberOf: text.to,
				session: internalSession
			}, function(e, d) {
				if (!d || !d.results) return;
				d.results.forEach(function(u) {
					if (u.id !== text.from) {
						notifyUser(u, payload);
					}
				});
			});
		}

		next();
	}, "gateway");

};
