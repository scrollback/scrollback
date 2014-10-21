/* jshint browser:true */
/* global libsb */

var spaceManager = require('./spaceManager.js');
var quickSettings = ["shownActions", "notifications"];


module.exports = function () {
	libsb.on("user-up", function(action, next) {
		var params = spaceManager.get('quick-settings', false);
		if (!params) params = {};
		if(/^guest-/.test(action.user.id)) {
			quickSettings.forEach(function(props) {
				if(!libsb.user.params) libsb.user.params = {};
				if(action.user.params[props]){
					libsb.user.params[props] = action.user.params[props];
					params[props] = libsb.user.params[props];
				}
				
			});
		}else{
			quickSettings.forEach(function(props) {
				if(!action.user.params[props] && params[props]) {
					action.user.params[props] = params[props];
				}
			});
		}
		spaceManager.set('quick-settings', params, false);
		next();
	}, 100);
	
	libsb.on("user-dn", function(action, next) {
		var params = {};
		if(!libsb.user.params) libsb.user.params = {};
		quickSettings.forEach(function(props) {
			if(action.user.params[props]) {
				params[props] = action.user.params[props];	
			}
		});
		spaceManager.set("user", libsb.user, false);
		spaceManager.set('quick-settings', params, false);
		next();
	}, 100);
	
	libsb.on("init-dn", function(action, callback) {
		var params = spaceManager.get('quick-settings', false);
		if (!params) params = {};
		if(!libsb.user.params) libsb.user.params = {};
		if(!action.user.id) {
			return callback();
		}
		quickSettings.forEach(function(props) {
			if(!action.user.params[props]) {
				if(params[props]) action.user.params[props] = params[props];
			} else {
				params[props] = action.user.params[props];
			}
		});
		spaceManager.set("user", libsb.user, false);
		spaceManager.set('quick-settings', params, false);
		callback();
	}, 1000);
};
