"use strict";

var express = require("express"),
	MemoryStore = express.session.MemoryStore,
	sessionStore = new MemoryStore();

var parse = express.session({
	secret: "ertyuidfghjcrtyujwsvokmdf",
	store: sessionStore,
	cookie: { maxAge: 3600000 }
});

exports.store = sessionStore;

exports.parser = function (req, res, next) {
	parse(req, res, function() {
		if (!req.session) {
			next();
		}
		if(!req.session.user) {
			req.session.user = {
				id: "guest", name: "Guest", picture: "",
				accounts: []
			};
		}
		next();
	});
};

exports.get = function(sid, cb) {
	sessionStore.get(sid, cb);
}