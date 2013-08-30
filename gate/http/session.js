"use strict";

var express = require("express"),
	store = new express.session.MemoryStore(),
	cookie = require("cookie"),
	guid = require("../../lib/guid.js"),
	names = require("../../lib/names.js"),
	_get = store.get,
	key = "scrollback_sessid";
	
function initUser() {
	return {
		id: 'guest-sb-' + names(6),
		picture: '/img/guest.png',
		rooms: {}
	};
}

exports.get = function(sid, cb) {
	sid = unsign(sid, function(id, session) {
		cb(null, session);
	});
};
exports.set = function(sid, sess, cb) {
	sid = unsign(sid, function(id) {
		store.set(id, sess);
	});
};

var exparse = express.session({
	secret: "ertyuidfghjcrtyujwsvokmdf",
	key: key,
	store: store
});

exports.store = store;

var parse = exports.parser = function(req, res, next) {
	exparse(req, res, function() {
		if(!req.session.user) req.session.user = initUser();
		next();
	});
};

function unsign(sid, cb) {
	var noop = function(){},
		fakeReq = {cookies: {}, signedCookies: {}, originalUrl: '/', on: noop, removeListener: noop},
		fakeRes = {on: noop};
	fakeReq.cookies[key] = sid;
	
	parse(fakeReq, fakeRes, function() {
		cb(fakeReq.sessionID, fakeReq.session);
	});
}

