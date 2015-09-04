/* eslint-env browser */
/* eslint complexity: 0 */
"use strict";

var gcmTimeValidity = 12 * 60 * 60 * 1000,
	objUtils = require("../lib/obj-utils.js"),
	userUtils = require("../lib/user-utils.js");

module.exports = function(core, config, store) {
	var LS = window.localStorage,
		device, initObject, initCallback, gcmRegisterSkipped = false;

	function addGcmData() {
		var userObj, params, key = "",
			defaultPackageName = config.pushNotification.defaultPackageName || "";
		if (!device || typeof initCallback !== "function" || !initObject) {
			return;
		}
		userObj = store.getUser();
		if (!userObj.id || userUtils.isGuest(userObj.id)) {
			initCallback();
			return;
		}

		params = userObj.params ? objUtils.clone(userObj.params) : {};
		params.pushNotifications = params.pushNotifications || {};
		params.pushNotifications.devices = params.pushNotifications.devices || {};
		
		initObject.params = initObject.params || {};
		initObject.params.pushNotifications = params.pushNotifications;
		initObject.params.pushNotifications.devices = params.pushNotifications.devices;
		device.expiryTime = new Date().getTime() + gcmTimeValidity;

		device.platform = "android";
		device.enabled = true;
		key = device.uuid + (device.packageName && device.packageName !== defaultPackageName ? ("_" + device.packageName) : "");

		initObject.params.pushNotifications.devices[key] = device;
		initCallback();
		LS.setItem("lastGCMTime", new Date().getTime());
		LS.setItem("currentDevice", device.uuid);
	}

	core.on("boot", function(state, next) {
		var lastGCMTime = LS.getItem("lastGCMTime");
		lastGCMTime = lastGCMTime ? parseInt(lastGCMTime, 10) : 0;

		if (
			state.context.env === "android" &&
			lastGCMTime < (new Date().getTime() - gcmTimeValidity) &&
			window.Android && typeof window.Android.registerGCM === "function"
		) {
			window.Android.registerGCM();
		} else {
			gcmRegisterSkipped = true;
		}
		next();
	}, 100);

	window.addEventListener("gcm_register", function(event) {
		device = objUtils.clone(event.detail);
		if (window.Android && typeof window.Android.getPackageName === "function") {
			device.packageName = window.Android.getPackageName();
		}
		addGcmData();
	});

	core.on("init-user-up", function(payload, next) {
		if (gcmRegisterSkipped) return next();
		initObject = payload;
		initCallback = next;
		addGcmData();
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
