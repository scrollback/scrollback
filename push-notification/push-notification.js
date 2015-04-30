var log = require("../lib/logger.js"),
	gcmNotify = require("./gcm-notify.js");

/*
 * devices : [{deviceName: device.name, registrationId: registrationId, enabled: true}]
 */

module.exports = function(core, config) {
	var user = require("../lib/user.js")(core, config);

	function mapUsersToIds(idList, cb) {
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
	}

	function notifyUsers(userList, payload) {
		/*
		 * The function takes a list of user objects and the push notification payload, and
		 * calls gcm_notify with a list of GCM registration ids and the payload.
		 */

		var regList = [];

		log.d(userList);

		userList.forEach(function(userObj) {
			var devices;

			if (userObj && userObj.params && userObj.params.pushNotifications && userObj.params.pushNotifications.devices) {
				devices = userObj.params.pushNotifications.devices;

				log.d("devices object: ", devices);

				if (Array.isArray(devices)) {
					return;
				}

				log.d("not an array: ", devices);

				Object.keys(devices).forEach(function(uuid) {
					var device = devices[uuid];

					log.d("device: ", uuid);

					if (device.hasOwnProperty("regId") && device.enabled === true) {
						regList.push({
							user: userObj,
							registrationId: device.regId
						});
					}
				});
			}
		});

		log.d("Got regLists of the room:", regList);

		gcmNotify(regList, payload, core, config);
	}

	core.on("text", function(text, next) {
		if (text.mentions.length) {
			onMentions(text);
		}

		if (text.thread === text.id) {
			onNewDisscussion(text);
		} else {
			onReply(text);
		}

		next();
	}, "gateway");

	function onMentions(text) {
		var payload;

		payload = {
			title: text.to + ": " + user.getNick(text.from) + " mentioned you",
			text: text.text.length > 400 ? text.text.substring(0, 400) + "…" : text.text,
			path: text.to + (text.thread ? "/" + text.thread : "")
		};

		mapUsersToIds(text.mentions, function(userList) {
			notifyUsers(userList, payload);
		});
	}

	function onReply(text) {
		var payload = {
				title: text.to + ": " + user.getNick(text.from) + " replied" + (text.title ? " in" + text.title : ""),
				text: text.text.length > 400 ? text.text.substring(0, 400) + "…" : text.text,
				path: text.to + (text.thread ? "/" + text.thread : "")
			};

		core.emit("getUsers", {
			memberOf: text.to,
			session: "internal-push-notifications"
		}, function(e, d) {
			var usersList;

			if (!(d && d.results)) {
				return;
			}

			usersList = d.results.filter(function(e) {
				return (e.id !== text.from);
			});

			notifyUsers(usersList, payload);
		});
	}

	function onNewDisscussion(text) {
		var payload, body;

		body = text.title ? text.title + " - " + text.text : text.text;

		if (typeof body !== "string" || !text) {
			return;
		}

		payload = {
			title: text.to + ": " + user.getNick(text.from) + " started a discussion",
			text: body.length > 400 ? body.substring(0, 400) + "…" : body,
			path: text.to + (text.thread ? "/" + text.thread : "")
		};

		core.emit("getUsers", {
			memberOf: text.to,
			session: "internal-push-notifications"
		}, function(e, d) {
			var usersList;

			if (!(d && d.results)) {
				return;
			}

			usersList = d.results.filter(function(e) {
				return (e.id !== text.from);
			});

			notifyUsers(usersList, payload);
		});
	}
};
