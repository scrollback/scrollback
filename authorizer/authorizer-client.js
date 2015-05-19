/* global $ */
"use strict";
var formField = require("../ui/utils/form-field.js"),
	handleAuthErrors = require('./handleAuthErrors.js');

module.exports = function(core) {
	core.on('conf-show', function(tabs, next) {
		var room = tabs.room,
//			guestPermRead = false,
			guestPermWrite = false,
//			registeredPermRead = false,
			registeredPermWrite = false,
//			followerPermRead = false,
			followerPermWrite = false,
//			readLevel,
			writeLevel;

		room.guides = room.guides || {};
		room.guides.authorizer = room.guides.authorizer || {};

		room.guides.authorizer.readLevel = room.guides.authorizer.readLevel || 'guest';
		room.guides.authorizer.writeLevel = room.guides.authorizer.writeLevel || 'guest';

//		readLevel = room.guides.authorizer.readLevel; // guest, registered, follower
		writeLevel = room.guides.authorizer.writeLevel;

		/*switch (readLevel) {
		case 'guest':
			guestPermRead = true;
			break;
		case 'registered':
			registeredPermRead = true;
			break;
		case 'follower':
			followerPermRead = true;
		}
*/
		switch (writeLevel) {
		case 'guest':
			guestPermWrite = true;
			break;
		case 'registered':
			registeredPermWrite = true;
			break;
		case 'follower':
			followerPermWrite = true;
		}

		var div = $('<div>').append(
//			formField('Who can read messages?', 'radio', "authorizer-read",[['authorizer-read-guest', 'Anyone (Public)', guestPermRead], ['authorizer-read-users', 'Logged in users', registeredPermRead], ['authorizer-read-followers', 'Followers', followerPermRead]]),
			formField('Who can post messages?', 'radio', "authorizer-write", [['authorizer-post-guest', 'Anyone (Public)', guestPermWrite], ['authorizer-post-users', 'Logged in users', registeredPermWrite], ['authorizer-post-followers', 'Followers', followerPermWrite]])
		);

		tabs.authorizer = {
			html: div,
			text: "Permissions"
		};

		next();
	}, 700);

	core.on('conf-save', function(room, next) {
		var mapRoles = {
				guest: 'guest',
				users: 'registered',
				followers: 'follower'
			},
//			readLevel = mapRoles[$('input:radio[name="authorizer-read"]:checked').attr('id').substring(16)],
			writeLevel = mapRoles[$('input:radio[name="authorizer-write"]:checked').attr('id').substring(16)];

		room.guides = room.guides || {};

		room.guides.authorizer = {
			readLevel: 'guest',
			writeLevel: writeLevel
		};
		next();
	}, 500);

	core.on('error-dn', function(error, next) {
		if (error.message === "ERR_NOT_ALLOWED") {
			handleAuthErrors(error);
		}

		next();
	}, 1000);
};
