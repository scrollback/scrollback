var log = require('../lib/logger.js'), config;
var gcm_notify = require('./gcm-notify.js');
var stringUtils = require('../lib/string-utils.js');
/*
	devices : [{deviceName: device.name, registrationId: registrationId, enabled: true}]
*/

module.exports = function(core, conf) {
	config = conf;
	function mapUsersToIds(idList, cb) {
		/*
			Takes an array of user ids, and calls the callback passed to it with the
			list of corresponding user objects.

			This functionality has to be ideally implemented in the entity loader, but since entity loader does not support
			this yet, this query has to be made.
		*/
		var cnt = idList.length;
		var userList = [];

		function done() {
			cnt--;
			if (cnt <= 0) cb(userList);
		}
		idList.forEach(function(id) {
			core.emit("getUsers", {
				ref: id,
				session: "internal-push-notifications"
			}, function(err, data) {
				if (!data || !data.results || !data.results[0]) return done();
				userList.push(data.results[0]);
				done();
			});
		});
	}

	function notifyUsers(userList, payload) {
		/*
			The function takes a list of user objects and the push notification payload, and
			calls gcm_notify with a list of GCM registration ids and the payload.
		*/
		var regList = [];
		userList.forEach(function(userObj) {
			if (userObj.params && userObj.params.pushNotifications && userObj.params.pushNotifications.devices) {
				var devices = userObj.params.pushNotifications.devices;
				devices.forEach(function(device) {
					if (device.hasOwnProperty('registrationId') && device.enabled === true) {
						regList.push({
							user: userObj,
							registrationId: device.registrationId
						});
					}
				});
			}
		});
		gcm_notify(regList, payload, core, config);
	}

	function makePayload(title, message, text) {
		/*
			Create a valid push notification payload
		*/
		var payload = {
			collapse_key: text.to, //for each room discard old message if not delivered
			notId: stringUtils.hashCode(text.to), // push notifications should be grouped by room name on the client device
			title: title,
			message: message,
			roomName: text.to,
			time: text.time,
			threadId: text.threads[0].id
		};
		var msgLen = JSON.stringify(payload).length;

		if (msgLen > 4 * 1024) {
			log.i("Payload too big for push notification, truncating ... ", JSON.stringify(payload));
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

		mapUsersToIds(mentions, function(userList) {
			notifyUsers(userList, payload);
		});

		// push notification on new thread creation.
		if (text.labels && text.labels.manualThreaded === 1 &&
			text.labels.startOfThread && text.threads[0]) {
			title = "[" + text.to + "] " + "new discussion";
			message = "[" + from + "] " + text.text;
			payload = makePayload(title, message, text);
			core.emit("getUsers", {
				memberOf: text.to,
				session: "internal-push-notifications"
			}, function(e, d) {
				if (!d || !d.results) return;
				notifyUsers(d.results, payload);
			});
		}

		next();
	}, "gateway");

};
