"use strict";
var crypto = require("crypto");
/*var log = require("../lib/logger.js")*/
var utils = require("../lib/app-utils.js");
var names = require("../lib/generate.js").names;

var core;

function generateNick(suggestion, callback) {
	var attemptingNick = suggestion || names(6);
	core.emit("getEntities", {
		ref: attemptingNick + "*",
		session: "internal-entityloader"
	}, function(err, query) {
		var i = 1,
			ids;
		if (err || !query || !query.results) return callback(err);

		ids = query.results.map(function(e) {
			return e.id.replace(/^guest-/, "");
		});

		if (!ids.length || ids.indexOf(attemptingNick) < 0) return callback(null, attemptingNick);

		while (i < 10) {
			if (ids.indexOf(attemptingNick) < 0) break;
			attemptingNick += i;
		}

		if (i === 10) return generateNick("", callback);

		callback(null, attemptingNick);
	});
}

function generatePick(id) {
	return "https://gravatar.com/avatar/" + crypto.createHash("md5").update(id).digest("hex") + "/?d=retro";
}


function initializerUser(action, callback) {
	var userObj;
	generateNick(action.suggestedNick || action.ref || "", function(err, nick) {
		if (err) return callback(err);

		nick = "guest-" + nick;
		if (!action.ref) action.from = nick;
		userObj = {
			id: nick,
			description: "",
			createTime: new Date().getTime(),
			type: "user",
			params: {},
			timezone: 0,
			identities: ["guest:" + nick],
			sessions: [action.session],
			picture: generatePick(nick)
		};

		action.user = userObj;
		
		callback();
	});
}

function initHandler(action, callback) {
	core.emit("getUsers", {
		ref: "me",
		session: action.session
	}, function(err, data) {
		var old;
		if (err || !data || !data.results || !data.results.length) {
			return initializerUser(action, function() {
				if (action.suggestedNick) {
					action.user.isSuggested = true;
					action.user.assignedBy = action.origin.host;
					action.user.requestedNick = action.suggestedNick;
				}
				return callback();
			});
		} else {
			old = action.user = data.results[0];
		}
		
		function allowSuggested(user) {
			if (user.isSuggested) return (action.origin.host === action.user.assignedBy && action.suggestedNick !== action.user.requestedNick);
			else return true;
		}
		if (action.suggestedNick && utils.isGuest(action.user.id) && allowSuggested(data.results[0])) {
			return initializerUser(action, function() {
				action.user.isSuggested = true;
				action.user.assignedBy = action.origin.host;
				action.user.requestedNick = action.suggestedNick;
				action.old = old;
				return callback();
			});
		} else {
			callback();
		}
	});
}


function loadProps(action, callback) {
	var wait = true,
		userID = action.user.id;
	core.emit("getRooms", {
		hasOccupant: userID,
		session: "internal-loader"
	}, function(err, rooms) {
		if (err || !rooms || !rooms.results || !rooms.results.length) {
			action.occupantOf = [];
		} else {
			action.occupantOf = rooms.results;
		}
		if (wait) wait = false;
		else callback();
	});
	if (!utils.isGuest(userID)) {
		core.emit("getRooms", {
			hasMember: userID,
			session: "internal-loader"
		}, function(err, rooms) {
			if (err || !rooms || !rooms.results || !rooms.results.length) {
				action.memberOf = [];
			} else {
				action.memberOf = rooms.results;
			}
			if (wait) wait = false;
			else callback();
		});
	} else {
		action.memberOf = [];
		if (wait) wait = false;
		else callback();
	}
}



module.exports = function(c) {
	core = c;
	core.on("init", function(init, next) {
		initHandler(init, function(err) {
			if (err) return next(err);
			next();
		});
	}, "loader");

	core.on("init", function(init, next) {
		loadProps(init, next);
	}, 600);
};
