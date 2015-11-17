"use strict";
var log = require("../lib/logger.js"),
	generateMentions = require("../entityloader/generateMentions.js"), loadRelatedUser, loadEntity,
	core, config, events = [ "text", "edit", "join", "part", "away", "back", "admit", "expel" ], handlers;

function loadMembers(room, callback) {
	core.emit("getUsers", {
		memberOf: room,
		session: "internal-loader"
	}, function(err, response) {
		if (err) return callback(err);
		callback(null, response.results);
	});
}

function loadOccupants(room, callback) {
	core.emit("getUsers", {
		occupantOf: room,
		session: "internal-loader"
	}, function(err, response) {
		if (err) return callback(err);
		callback(null, response.results);
	});
}

function loadVictim(action, next) {
	loadRelatedUser(action.to, action.ref, "internal-loader", function(err, result) {
		if (err) return next(err);
		action.victim = result;
		return next();
	});
}

function loadMe(action, next) {
	loadRelatedUser("", "me", action.session, function(err, user) {
		if (err) return next(err);
		action.user = user;
		next();
	});
}

function loadThread(action, next) {
	if (!action.thread || action.thread === action.id) return next();
	core.emit("getThreads", {
		ref: action.thread,
		to: action.to,
		session: "internal-loader"
	}, function(err, response) {
		if (err) return next(err);
		if (!response || !response.results) return next(new Error("THREAD_NOT_FOUND"));
		action.threadObject = response.results[0];
		return next();
	});
}


handlers = {
	text: function(text, next) {
		loadThread(text, function(err) {
			if (err) return next(err);
			generateMentions(text, next);
		});
	},

	edit: function(edit, next) {
		var count = 0,
			queriesCount = 2,
			isErr = false;

		function done(error) {
			if (isErr) return;

			if (error) {
				isErr = true;
				next(error);
				return;
			}

			count++;
			if (count === queriesCount) generateMentions(edit, next);
		}
		core.emit("getTexts", {
			ref: edit.ref,
			to: edit.to,
			session: "internal-loader"
		}, function(err, response) {
			if (err) return done(err);
			if (!response || !response.results || !response.results.length) return done(new Error("TEXT_NOT_FOUND"));
			edit.old = response.results[0];
			done();
		});
		loadThread(edit, done);
	},
	admit: loadVictim,
	expel: loadVictim
};

function basicLoad(action, next) {
	var count = 0,
		queriesCount = 0,
		isErr = false;
	log.i("Got action: ", action);

	function done(error) {
		if (isErr) return;

		if (error) {
			isErr = true;
			log.i("throwing error: ", error);
			next(error);
			return;
		}
		count++;
		log.d(action.id + " incrementing count " + count);

		if (count === queriesCount) {
			log.d(action.id + " basic loading done: ", action);
			if (handlers[action.type]) handlers[action.type](action, next);
			else next();
		}
	}

	queriesCount++;
	loadRelatedUser(action.to, "me", action.session, function(err, result) {
		log.d(action.id + " loading relatedUser", err, result);
		if (err) return done(err);
		action.user = result;
		done();
	});

	queriesCount++;
	loadEntity(action.to, "room", "internal-loader", function(err, result) {
		log.d(action.id + " loading entity", err, result);
		if (err) return done(err);
		action.room = result;
		done();
	});


	if (action.type === "text" || action.type === "edit") {
		queriesCount++;
		loadMembers(action.to, function(err, result) {
			log.d(action.id + " loading members", err, result);
			if (err) return done(err);
			action.members = result;
			done();
		});

		queriesCount++;
		loadOccupants(action.to, function(err, result) {
			log.d(action.id + " loading occupants", err, result);
			if (err) return done(err);
			action.occupants = result;
			done();
		});
	}
}

module.exports = function(c, conf) {
	core = c;
	config = conf;

	loadRelatedUser = require("../entityloader/relatedUser.js")(core, config);
	loadEntity = require("../entityloader/entity.js")(core, config);
	events.forEach(function(event) {
		core.on(event, basicLoad, "loader");
	});

	core.on("note", loadMe, "loader");
	core.on("upload/getPolicy", loadMe, "loader");


	require("../entityloader/userHandler.js")(core, config);
	require("../entityloader/initHandler.js")(core, config);
	require("../entityloader/queryHandler.js")(core, config);

	core.on("room", function(action, next) {
		loadRelatedUser(action.to, "me", action.session, function(err, user) {
			log.d(action.id + " loading relatedUser", err, user);
			action.user = user;

			loadEntity(action.to, "room", "internal-loader", function(error, room) {
				if (error) {
					if (error.message === "NO_ROOM_WITH_GIVEN_ID") {
						action.old = {};
						action.occupants = [];
						action.members = [];
						next();
					} else {
						next(err);
					}
					return;
				}
				action.old = room;
				next();
			});
		});
	}, "loader");
};
