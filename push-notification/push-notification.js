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
	max = 400,
	defaultPackageName, keys;

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

		userList = userList.filter(function(user) {
			return user && user.params && user.params.pushNotifications && user.params.pushNotifications.devices;
		});

		userList.forEach(function(userObj) {
			var devices, packageName;
			devices = userObj.params.pushNotifications.devices;

			log.d("devices object: ", devices);

			//handling old format of devices.
			if (Array.isArray(devices)) {
				return;
			}

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
		});

		log.d("Got regLists of the room:", notesForApps);

		gcmNotify(notesForApps, payload, core, config);
	}

	function generateMentionPayload(text) {
		var payload, body;

		body = format.mdToText(text.text);

		payload = {
			title: text.to + ": " + userUtils.getNick(text.from) + " mentioned you",
			text: body.length > max ? body.substring(0, max) + "…" : body,
			picture: userUtils.getPicture(text.from),
			group: text.to + "/" + text.thread,
			path: url.build({
				nav: {
					mode: "chat",
					room: text.to,
					thread: text.thread,
					textRange: {
						time: text.time
					}
				}
			})
		};

		return payload;
	}

	function generateThreadPayload(text) {
		var payload, body;

		body = format.mdToText(text.title ? text.title + " - " + text.text : text.text);

		payload = {
			title: text.to + ": " + userUtils.getNick(text.from) + " started a discussion",
			text: body.length > max ? body.substring(0, max) + "…" : body,
			picture: userUtils.getPicture(text.from),
			group: text.to,
			path: url.build({
				nav: {
					mode: "chat",
					room: text.to,
					thread: text.thread,
					textRange: {
						time: text.time
					}
				}
			})
		};


		return payload;
	}

	function generateReplyPayload(text) {
		var payload, body;
		body = format.mdToText(text.text);
		payload = {
			title: text.to + ": " + userUtils.getNick(text.from) + " replied" + (text.title ? " in " + text.title.slice(0, 160) : ""),
			text: body.length > max ? body.substring(0, max) + "…" : body,
			picture: userUtils.getPicture(text.from),
			group: text.to + "/" + text.thread,
			path: url.build({
				nav: {
					mode: "chat",
					room: text.to,
					thread: text.thread,
					textRange: {
						time: text.time
					}
				}
			})
		};


		return payload;
	}

	var payloads = {
		mention: generateMentionPayload,
		reply: generateReplyPayload,
		thread: generateThreadPayload
	};


	core.on("text", function(text) {
		var userIDs = [],
			groups, notify = text.notify;

		groups = {
			mention: [],
			reply: [],
			thread: []
		};

		userIDs = Object.keys(notify);

		if (!userIDs.length) {
			return;
		}

		userIDs.forEach(function(userID) {
			if (notify[userID].mention >= 80) {
				groups.mention.push(userID);
			} else if (notify[userID].thread >= 30) {
				groups.thread.push(userID);
			} else if (notify[userID].reply > 30) {
				groups.reply.push(userID);
			}
		});

		Object.keys(groups).forEach(function(noteType) {
			var payload;

			if (!groups[noteType].length) {
				return;
			}

			payload = payloads[noteType](text);

			mapIdsToUsers(groups[noteType], function(userList) {
				notifyUsers(userList, payload);
			});
		});
	}, "gateway");
};

