var log = require('../lib/logger.js'),
	config;
var gcm_notify = require('./gcm-notify.js');
/*
	devices : [{deviceName: device.name, registrationId: registrationId, enabled: true}]
*/

module.exports = function(core, conf) {
	config = conf;

/*	function mapUsersToIds(idList, cb) {
		core.emit("getUsers", {
			session: "internal-push-notifications",
			ref: idList
		}, function(err, query) {
			if (err) {
				log.e("Error loading users in push notifications");
				return;
			}
			cb(query.results);
		});
	}*/

	function notifyUsers(userList, payload) {
		/*
			The function takes a list of user objects and the push notification payload, and
			calls gcm_notify with a list of GCM registration ids and the payload.
		*/
		var regList = [];
		log.d(userList);
		userList.forEach(function(userObj) {
			if (userObj && userObj.params && userObj.params.pushNotifications && userObj.params.pushNotifications.devices) {
				var devices = userObj.params.pushNotifications.devices;
				log.d("devices object: ", devices);
				if (devices instanceof Array) return;
				log.d("not an array: ", devices);
				Object.keys(devices).forEach(function(uuid) {
					var device = devices[uuid];
					log.d("device: ", uuid);
					if (device.hasOwnProperty('regId') && device.enabled === true) {
						regList.push({
							user: userObj,
							registrationId: device.regId
						});
					}
				});
			}
		});

		log.d("Got regLists of the room:", regList);
		gcm_notify(regList, payload, core, config);
	}
	
	core.on('text', function(text, next) {
		log.d("Got text:", text);
//		if (text.mentions.length) onMentions(text);
//		if (text.thread == text.id) onNewDisscussion(text);
//		Temp thing: remove ASAP
		onNewDisscussion(text);
		next();
	}, "gateway");

/*	function onMentions(text) {
		var from = text.from.replace(/^guest-/, "");
		var payload = {
			title: from + " mentioned you in " + text.to,
			text: text.text.length > 100 ? text.text.substring(0, 100) : text.text,
			path: text.to + (text.thread ? "/" + text.thread : "")
		};
		mapUsersToIds(text.mentions, function(userList) {
			notifyUsers(userList, payload);
		});
	}*/

	function onNewDisscussion(text) {
		var from = text.from.replace(/^guest-/, "");
		var payload = {
			title: from + ": " + text.title,
			text: text.text.length > 100 ? text.text.substring(0, 100) : text.text,
			path: text.to + (text.thread ? "/" + text.thread : "")
		};
		core.emit("getUsers", {
			memberOf: text.to,
			session: "internal-push-notifications"
		}, function(e, d) {
			var usersList;
			log.d("Got users of the room:", d);
			if (!d || !d.results) return;
			
			usersList = d.results.filter(function(e) {
//				return (e.id !== text.from) && (text.mentions.indexOf(e.id) < 0);
				return (e.id !== text.from);
			});
			log.d("Users: ", usersList);
			notifyUsers(usersList, payload);
		});
	}
};
