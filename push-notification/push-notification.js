"use strict";

/*
 * GCM messages have a maximum length of 4096 bytes.
 *
 * 1 UTF-8 character takes upto 4 bytes.
 *
 * No. of bytes for a message like the following,
 *
 * 		text.to + ": " + text.from + " replied in " + text.title.slice(0, 160)
 *
 *		(32 + 2 + 32 + 12 + 160) * 4 = 952
 *
 */

var log = require("../lib/logger.js"),
	url = require("../lib/url.js"),
	format = require("../lib/format.js"),
	userUtils = require("../lib/user-utils.js"),
	gcmNotify = require("./gcm-notify.js"),
	max = 400, defaultPackageName, keys;

/*
 * devices : [{ deviceName: device.name, registrationId: registrationId, enabled: true }]
 */

module.exports = function(core, config) {
	if (!config || !config.keys || !Object.keys(config.keys).length) {
		log.i("Push notification disable: no keys specified in config.");
		return;
	}

	defaultPackageName = config.defaultPackageName;
	keys = config.keys;

	function mapIdsToUsers(idList, cb) {
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

		var notesForApps = {};

		for (var i in keys) {
			notesForApps[i] = {};
		}

		log.d(userList);

		userList.forEach(function(userObj) {
			var devices, packageName;

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
						packageName = device.packageName || defaultPackageName;

						if (notesForApps[packageName]) {
							notesForApps[packageName][device.regId] = userObj;
						}
					}
				});
			}
		});

		log.d("Got regLists of the room:", notesForApps);

		gcmNotify(notesForApps, payload, core, config);
	}

	function onMentions(text) {
		var payload, body;

		body = format.mdToText(text.text);

		payload = {
			title: text.to + ": " + userUtils.getNick(text.from) + " mentioned you",
			text: body.length > max ? body.substring(0, max) + "…" : body,
			path: url.build({
				nav: {
					mode: "chat",
					room: text.to,
					thread: text.thread,
					textRange: { time: text.time }
				}
			})
		};

		mapIdsToUsers(text.mentions, function(userList) {
			notifyUsers(userList, payload);
		});
	}

	function onNewDisscussion(text) {
		var payload, body;

		body = format.mdToText(text.title ? text.title + " - " + text.text : text.text);

		if (typeof body !== "string" || !text) {
			return;
		}

		payload = {
			title: text.to + ": " + userUtils.getNick(text.from) + " started a discussion",
			text: body.length > max ? body.substring(0, max) + "…" : body,
			path: url.build({
				nav: {
					mode: "chat",
					room: text.to,
					thread: text.thread,
					textRange: { time: text.time }
				}
			})
		};

		core.emit("getUsers", {
			memberOf: text.to,
			session: "internal-push-notifications"
		}, function(e, d) {
			var usersList;

			if (!(d && d.results)) {
				return;
			}

			usersList = d.results.filter(function(err) {
				return (err.id !== text.from);
			});

			notifyUsers(usersList, payload);
		});
	}

	core.on("text", function(text) {
		if (text.mentions.length) {
			onMentions(text);
		}

		if (text.thread === text.id) {
			onNewDisscussion(text);
		}
	}, "gateway");
};
