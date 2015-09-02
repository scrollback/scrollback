/* eslint-env browser */
/* eslint complexity: 0 */
"use strict";

var gcmTimeValidity = 12 * 60 * 60 * 1000,
	updateDevice = false,
	objUtils = require("../lib/obj-utils.js"),
	userUtils = require("../lib/user-utils.js");

module.exports = function(core, config, store) {
	var LS = window.localStorage,
		lastGCMTime, device, initObject, initCallback, userActionID, uuid, key = "",
		defaultPackageName;

	defaultPackageName = config.pushNotification.defaultPackageName || "";

	lastGCMTime = LS.getItem("lastGCMTime");
	lastGCMTime = lastGCMTime ? parseInt(lastGCMTime, 10) : 0;

	function addGcmData() {
		if (!device || !initCallback || !initObject) {
			if (typeof initCallback === "function") {
				initCallback();
			}
			return;
		}
		var userObj = store.getUser();
		if (!userObj.id || userUtils.isGuest(userObj.id)) {
			initCallback();
			return;
		}


		var params = userObj.params ? objUtils.clone(userObj.params) : {};
		initObject.params = params;
		initObject.params.pushNotifications = params.pushNotifications || {};
		initObject.params.pushNotifications.devices = params.pushNotifications.devices || {};
		device = objUtils.clone(device);
		device.expiryTime = new Date().getTime() + gcmTimeValidity;
		uuid = device.uuid;

		device.platform = "android";
		key = device.uuid + (device.packageName && device.packageName !== defaultPackageName ? ("_" + device.packageName) : "");

		initObject.params.pushNotifications.devices[key] = device;
		device.enabled = true;
		userActionID = userObj.id;
		updateDevice = false;
		initCallback();
	}

	core.on("boot", function(state, next) {
		if (state.context.env === "android") {
			if (lastGCMTime < (new Date().getTime() - gcmTimeValidity)) {

				if (window.Android && typeof window.Android.registerGCM === "function") {
					window.Android.registerGCM();
				}

				window.addEventListener("gcm_register", function(event) {
					device = event.detail;

					if (window.Android && typeof window.Android.getPackageName === "function") {
						device.packageName = window.Android.getPackageName();
					}

					updateDevice = true;
//					if (store.get("app", "connectionStatus") === "online") {
//						addGcmData();
//					}
				});
			} /* else if (typeof initCallback === "function") {
				initCallback();
			} */
		}
		next();
	}, 100);

	core.on("init-user-up", function(payload, next) {
		if (store.get("context").env === "web") {
			return next();
		}
		initObject = payload;
		initCallback = next;
		addGcmData();
	});

	core.on("statechange", function(changes, next) {
		if (changes.user && device && updateDevice) {
			addGcmData();
		}
		next();
	}, 500);

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
