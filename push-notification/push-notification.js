// var log = require('../lib/logger.js');
var notify = require('./notify.js');
var config = require('../config.js');
var internalSession = Object.keys(config.whitelists)[0];

/*
	devices : [{deviceName: device.name, registrationId: registrationId, enabled: true}]
*/

module.exports = function(core) {
	function notifyUserId(id, payload) {
		core.emit("getUsers", {
			ref: id,
			session: internalSession
		}, function(err, data) {
			if (!data || !data.results || !data.results[0]) return;
			notifyUser(data.results[0], payload);
		});
	}

	function notifyUser(userObj, payload) {
		if (userObj.params.pushNotifications && userObj.params.pushNotifications.devices) {
			var devices = userObj.params.pushNotifications.devices;
			devices.forEach(function(device) {
				if (device.hasOwnProperty('registrationId') && device.enabled === true) {
					// send notification
					notify(payload, [device.registrationId]);
				}
			});
		}
	}
	core.on('text', function(text, next) {

		// push notification when user is mentioned in a text message.
		var mentions = text.mentions ? text.mentions : [];
		var payload = {
			title: text.from + " has mentioned you on " + text.to,
			message: text.text,
			text: text
		};
		mentions.forEach(function(user) {
			notifyUserId(user, payload);
		});


		// push notification on new thread creation.
		if (text.labels && text.labels.hasOwnProperty('startOfThread') &&
			text.labels.startOfThread === 1 && text.threads[0]) {
			payload = {
				title: text.from + " has started a new discussion on " + text.to,
				message: text.threads[0].title,
				text: text
			};
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