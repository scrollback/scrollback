/* jshint browser:true */
var appUtils = require("../lib/app-utils.js");
var LS = window.localStorage, core, config, store;

module.exports = function (c,conf, st) {
	core = c;
	config = conf;
	store = st;
	var currentNotifications = LS.getItem("notifications");
	try {
		currentNotifications = JSON.parse(currentNotifications);
	} catch(e) {
		currentNotifications = {
			sound : true
		};
	}
	
	core.on("user-dn", function (action, next) {
		var user = action.user;
		if(user.params && user.params.notifications && appUtils.isGuest(store.get("user"))){
			currentNotifications = user.params.notifications;
			LS.setItem("notifications", JSON.stringify(currentNotifications));
		}
		next();
	}, 1000);

	core.on("setstate", function(changes, next) {
		var user = changes.user || store.get("user");
		if(changes.entities && changes.entities[user] && user && appUtils.isGuest(user)) {
			if(changes.entities[user].params)changes.entities[user].params = {};
			changes.entities[user].params.notifications = currentNotifications;
		}
		next();
	}, 800);
};
