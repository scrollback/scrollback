/* jshint browser: true */

var core, config, store, gcmTimeValidity = 7 * 24 * 60 * 60 * 1000, updateDevice = false, userUpQueued = false,
	appUtils = require("../lib/app-utils.js");

module.exports = function(c, conf, st) {
	var LS = window.localStorage, lastGCMTime, device;
	core = c;
	config = conf;
	store = st;

	lastGCMTime = LS.getItem("lastGCMTime");
	lastGCMTime = lastGCMTime ? parseInt(lastGCMTime) : 0;

	core.on("boot", function(state, next) {
		console.log(state.context.env, lastGCMTime, (new Date().getTime() - gcmTimeValidity), lastGCMTime < (new Date().getTime() - gcmTimeValidity));
		if (state.context.env === "android" && lastGCMTime < (new Date().getTime() - gcmTimeValidity)) {

			if (window.Android && typeof window.Android.registerGCM === "function") {
				window.Android.registerGCM();
			}

			window.addEventListener("gcm_register", function(event) {
				console.log("got device details", event);
				device = event.detail;
				updateDevice = true;
			});
		}
		next();
	}, 100);

	core.on("statechange", function(changes, next) {
		var userObj, userId = store.get("user");

		if (changes.user && !appUtils.isGuest(userId) && device && updateDevice) {
			console.log("got device id.");

			userObj = store.getUser(userId);

			if (userObj === "missing") {
				userUpQueued = true;
				next();
				return;
			}

			updateUser(userObj);

		} else if (userUpQueued && changes.entities && changes.entities[userId] && typeof changes.entities[userId] === "object") {
			updateUser(changes.entities[userId] );
		}
		next();
	}, 500);

	function updateUser(userObj) {
		var uuid;

		if (!userObj.params) userObj.params = {};
		if (!userObj.params.pushNotifications) userObj.params.pushNotifications = {};
		if (!userObj.params.pushNotifications.devices || userObj.params.pushNotifications.devices instanceof Array) {
			userObj.params.pushNotifications.devices = {};
		}
		device.expiryTime = new Date().getTime() + gcmTimeValidity;
		uuid = device.uuid;
		userObj.params.pushNotifications.devices[device.uuid] = device;
		delete device.uuid;
		device.enabled = true;
		console.log("emitting user-up.");
		userUpQueued = false;
		core.emit("user-up", userObj, function() {
			LS.setItem("lastGCMTime", new Date().getTime());
			LS.setItem("currentDevice", uuid);
		});
	}

	core.on("logout", function(payload, next) {
		if (store.get("context", "env") === "android" && window.Android && typeof window.Android.unregisterGCM === "function") {
			window.Android.unregisterGCM();
		}

		next();
	}, 500);
};
