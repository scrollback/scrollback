/*
	Scrollback: Beautiful text chat for your community. 
	Copyright (c) 2014 Askabt Pte. Ltd.
	
This program is free software: you can redistribute it and/or modify it 
under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or any 
later version.

This program is distributed in the hope that it will be useful, but 
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see http://www.gnu.org/licenses/agpl.txt
or write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330,
Boston, MA 02111-1307 USA.
*/

"use strict";
var config = require("../config.js");
var crypto = require('crypto');

var express = require("express"),
	RedisStore = require('connect-redis')(express),
	store =new RedisStore({
	    host: config.redis.host,
	    port: config.redis.port,
	    db: config.redis.db
	}),
	signature = require("express/node_modules/cookie-signature"),
	cookie = require("cookie"),
	guid = require("../lib/guid.js"),
	names = require("../lib/names.js"),
	_get = store.get,
	key = "scrollback_sessid",
	secret = "ertyuidfghjcrtyujwsvokmdf",
	watchers = {};
	
function initUser() {
	var guestname = 'guest-sb-' + names(6);
	var guestpic = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(guestname).digest('hex') + '/?d=identicon&s=48';
	return {
		id: guestname,
		picture: guestpic,
		accounts: [],
		rooms: {}
	};
}

exports.get = function(user, cb) {
	unsign(user.sid, function(id, session) {
		store.set(id, session);
		cb(null, session);
	});
};
var set = exports.set = function(sid, sess, cb) {
	var i;
	unsign(sid, function(id) {
		store.set(id, sess);
	});
};

var exparse = express.session({
	secret: secret,
	key: key,
	store: store,
	cookie: { domain: config.http.cookieDomain, httpOnly : false }
});

exports.store = store;

var parse = exports.parser = function(req, res, next) {
	exparse(req, res, function() {
		if(!req.session.user) {
			req.session.user = initUser();
			req.session.cookie.value = 's:' + signature.sign(req.sessionID, secret);
			store.set(req.sessionID, req.session);
		}
		next();
	});
};

function unsign(sid, cb) {
	var noop = function(){},
		fakeReq = {cookies: {}, signedCookies: {}, originalUrl: '/', on: noop, removeListener: noop},
		fakeRes = { on: noop };
	fakeReq.cookies[key] = sid;
	
	parse(fakeReq, fakeRes, function() {
		cb(fakeReq.sessionID, fakeReq.session);
	});
}

