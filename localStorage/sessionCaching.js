/* jshint browser:true */
/* global libsb */

var generate = require('../lib/generate');
var spaceManager = require('./spaceManager.js');

window.timeoutMapping = {};

module.exports = function (objCacheOps) {
	libsb.on('init-up', function (init, next) {
		var sid;
		if (localStorage.hasOwnProperty('session')) {
//			libsb.session = sid = JSON.parse(localStorage.session);
			libsb.session = sid = spaceManager.get('session', false);
		}
		if (!sid) {
			sid = "web://" + generate.uid();
			libsb.session = sid;
			spaceManager.set('session', sid, false);
		}
		init.session = sid;
		return next();
	}, "validation");


	libsb.on('init-dn', function (init, next) {
		// on signup.
		if (init.auth && !init.user.id) return next();

		var user = init.user;
		var occupantOf = init.occupantOf;
		var memberOf = init.memberOf;

		var rooms = {};
		if (localStorage.hasOwnProperty('rooms')) {
			rooms = JSON.parse(localStorage.rooms);
		}

		init.occupantOf.forEach(function (room) {
			rooms[room.id] = room;
			objCacheOps.delRoomTimeOut(room.id);
		});

		init.memberOf.forEach(function (room) {
			rooms[room.id] = room;
			objCacheOps.delRoomTimeOut(room.id);
		});

		// saving to LS
		
		spaceManager.set('user', user, false); // false implies do not add entry to LRU.
		spaceManager.set('occupantOf', occupantOf, false);
		spaceManager.set('memberOf', memberOf, false);
		spaceManager.set('rooms', rooms, false);

		next();
	}, 500);

	libsb.on('logout', function logout(p, n) {
		// delete user session here
		delete libsb.session;
		delete libsb.user;
		localStorage.clear(); // clear LocalStorage on logout for security reasons
		n();
	}, 1000);
};