"use strict";
var generateMentions = require("./generateMentions.js");
var loadRelatedUser, loadEntity;

/* list of event that the basic validation function is called for.*/
var core, config, events = ["text", "edit", "join", "part", "away", "back", "admit", "expel", "room"];

function loadMembers(room, callback) {
	core.emit("getUsers", {
		memberOf: room,
		session: "internal-loader"
	}, function(err, response) {
		if (err) return callback(err);
		callback(response.results);
	});
}

function loadOccupants(room, callback) {
	core.emit("getUsers", {
		occupantOf: room,
		session: "internal-loader"
	}, function(err, response) {
		if (err) return callback(err);
		callback(response.results);
	});
}

function loadVictim(action, next) {
	loadRelatedUser(action.to, action.ref, "internal-loader", function(err, result) {
		if (err) return next(err);
		action.victim = result;
		return next();
	});
}

function loadThread(action, next) {
	if(!action.thread) return next(); 
	core.emit("getThreads", {ref: action.thread}, function(err, response) {
		if(err) return next(err);
		if(!response || !response.results) return next(new Error("THREAD_NOT_FOUND"));
		action.threadObject = response.results[0];
		return next();
	});
}


var handlers = {
	text: function(text, next){
		loadThread(text, function(err) {
			if(err) return next(err);
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
		core.emit("getText", {ref:edit.ref}, function(err, response) {
			if(err) return done(err);
			if(!response || !response.results || !response.results.length) return done(new Error("TEXT_NOT_FOUND"));
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
		queriesCount = 4,
		isErr = false;

	function done(error) {
		if (isErr) return;

		if (error) {
			isErr = true;
			next(error);
			return;
		}

		count++;
		if (count === queriesCount) {
			if(handlers[action.type]) handlers[action.type](action, next);
			else next();
		}
	}

	loadRelatedUser(action.to, "me", action.session, function(err, result) {
		if (err) return done(err);
		action.user = result;
		done();
	});

	loadEntity(action.to, "room", "internal-loader", function(err, result) {
		if (err) return done(err);
		if(action.type === "room") action.old = result;
		else action.room = result;
	});

	loadMembers(action.to, function(err, result) {
		if (err) return done(err);
		action.members = result;
	});

	loadOccupants(action.to, function(err, result) {
		if (err) return done(err);
		action.occupants = result;
	});
}

module.exports = function(c, conf) {
	core = c;
	config = conf;
	loadRelatedUser = require("./relatedUser.js")(core, config);
	loadEntity = require("./entity.js")(core, config);
	events.forEach(function(event) {
		core.emit(event, basicLoad, "loader");
	});
	require("./useHandler.js")(core, config);
	require("./initHandler.js")(core, config);
	require("./queryHandler.js")(core, config);

};
