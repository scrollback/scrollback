/* eslint-env browser */

"use strict";

var gcmTimeValidity = 12 * 60 * 60 * 1000,
	updateDevice = false,
	objUtils = require("../lib/obj-utils.js"),
	userUtils = require("../lib/user-utils.js");

module.exports = function(core, config, store) {
	var LS = window.localStorage,
		lastGCMTime, device, deviceInfo, userObj, uuid, key = "", defaultPackageName, userActionID;

	defaultPackageName = config.pushNotification.defaultPackageName || "";

	lastGCMTime = LS.getItem("lastGCMTime");
	lastGCMTime = lastGCMTime ? parseInt(lastGCMTime, 10) : 0;

	function getDevicesInfo() {
		if (!device) return null;
		userObj = store.getUser();
		userObj = objUtils.clone(userObj);
		if (!userObj.id || userUtils.isGuest(userObj.id)) return null;
		var pushNotifications = userObj.params.pushNotification || {};
		pushNotifications.devices = userObj.params.pushNotification.devices || {};
		device.expiryTime = new Date().getTime() + gcmTimeValidity;
		uuid = device.uuid;

		device.platform = "android";
		key = device.uuid + (device.packageName && device.packageName !== defaultPackageName ? ("_" + device.packageName) : "");
		pushNotifications.devices[key] = device;
		device.enabled = true;
		return pushNotifications;
	}

	core.on("boot", function(state, next) {
		if (state.context.env === "android" && lastGCMTime < (new Date().getTime() - gcmTimeValidity)) {

			if (window.Android && typeof window.Android.registerGCM === "function") {
				window.Android.registerGCM();
			}

			window.addEventListener("gcm_register", function(event) {
				device = event.detail;

				if (window.Android && typeof window.Android.getPackageName === "function") {
					device.packageName = window.Android.getPackageName();
				}

				updateDevice = true;
				if (store.get("app", "connectionStatus") === "online") {
					deviceInfo = getDevicesInfo();
					if (deviceInfo) {
						userObj = store.getUser();
						userObj = objUtils.clone(userObj);
						userObj.params.pushNotification = deviceInfo;
					}
					core.emit("user-up", {
						user: userObj,
						to: "me"}, function(err, action) {
						if (err) return;
						userActionID = action.id;
					});
				}
			});

		}
		next();
	}, 100);

	core.on("init-user-up", function(userObject, next) {
		if (store.get("context").env === "web") {
			return next();
		}
		deviceInfo = getDevicesInfo();
		if (deviceInfo) {
			userObj = store.getUser();
			userObject = objUtils.clone(userObj);
			userObject.params.pushNotification = deviceInfo;
		}
		next();
	});

	// for user sign in or sign up.
	core.on("statechange", function(changes, next) {
		if (changes.user && device && updateDevice) {
			deviceInfo = getDevicesInfo();
			userObj = store.getUser();
			userObj = objUtils.clone(userObj);
			if (deviceInfo) userObj.params.pushNotification = deviceInfo;

			core.emit("user-up", {
				user: userObj,
				to: "me"}, function(err, action) {
				if (err) return;
				userActionID = action.id;
			});
		}
		next();
	}, 500);

	// saving the last update time only if the user-up succeeds.
	core.on("user-dn", function(action) {
		if (action.id === userActionID) {
			LS.setItem("lastGCMTime", new Date().getTime());
			LS.setItem("currentDevice", uuid);
			updateDevice = false;
		}
	});

	core.on("logout", function(payload, next) {
		if (store.get("context", "env") === "android" && typeof window.Android.unregisterGCM === "function") {
			window.Android.unregisterGCM();
			localStorage.removeItem("lastGCMTime");
			localStorage.removeItem("currentDevice");
		}
		next();
	}, 500);
};
