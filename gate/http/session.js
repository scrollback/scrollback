"use strict";

var express = require("express"),
	store = new express.session.MemoryStore(),
	guid = require("../../lib/guid.js"),
	_get = store.get;
	
	store.get = function(sid, cb) {
		_get.call(store, sid, function(err, session) {
			if(session && !session.user) initUser(session);
			return cb(err, session);
		});
	};
	

function initUser(session) {
	session.user = {
		id: 'guest-sb' + guid(4),
		picture: '/img/guest.png',
		rooms: {}
	};
	return session;
}

exports.store = store;
exports.get = function(sid, cb) {
	store.get(sid, function(err, session) {
		console.log("Session get complete: ", arguments);
		if(!session) session = initUser({});
		console.log("Returning session:", session);
		cb(err, session);
	});
};
exports.set = store.set;

exports.parser = express.session({
	secret: "ertyuidfghjcrtyujwsvokmdf",
	store: store,
	cookie: { maxAge: 3600000 }
});

