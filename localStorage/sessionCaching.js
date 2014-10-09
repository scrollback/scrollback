/* jshint browser:true */
/* global libsb */

var generate = require('../lib/generate');

window.timeoutMapping = {};

function delRoomTimeOut(roomId) {
	/*
		this function deletes a saved room object from the cache every 'n' mintues
	*/
	var minutes = 10; // 10 minutes timeout

	clearTimeout(window.timeoutMapping[roomId]);

	window.timeoutMapping[roomId] = setTimeout(function () {
		if (this.cache && this.cache.rooms) {
			delete this.cache.rooms[roomId];
			this.save();
		}
	}, minutes * 60 * 1000);
}


libsb.on('init-up', function (init, next) {
	var sid;
	if (localStorage.hasOwnProperty('session')) {
		libsb.session = sid = localStorage.session;
	}
	if (!sid) {
		sid = "web://" + generate.uid();
		libsb.session = sid;
		localStorage.session = sid;
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
		delRoomTimeOut(room.id);
	});

	init.memberOf.forEach(function (room) {
		rooms[room.id] = room;
		delRoomTimeOut(room.id);
	});

	// saving to LS
	localStorage.user = JSON.stringify(user);
	localStorage.occupantOf = JSON.stringify(occupantOf);
	localStorage.memberOf = JSON.stringify(memberOf);
	localStorage.rooms = JSON.stringify(rooms);

	next();
}, 500);

libsb.on('logout', function logout(p, n) {
	// delete user session here
	delete libsb.session;
	delete libsb.user;
	localStorage.clear(); // clear LocalStorage on logout for security reasons
	n();
}, 1000);