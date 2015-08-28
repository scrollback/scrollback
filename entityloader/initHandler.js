"use strict";
var crypto = require("crypto");
var names = require("../lib/generate.js").names;
var userUtils = require('../lib/user-utils.js');
var 	log = require("../lib/logger.js");
var core;

function generateNick(suggestion, callback) {
	var attemptingNick;
	attemptingNick = suggestion = suggestion || names(6);
	core.emit("getEntities", {
		ref: suggestion + "*",
		session: "internal-entityloader"
	}, function(err, query) {
		var i = 1,
			ids;
		if (err || !query || !query.results) {
			return callback(err);
		}
		ids = query.results.map(function(e) {
			return e.id.replace(/^guest-/, "");
		});

		log.d(attemptingNick+" search results: ", ids);
		if (!ids.length || ids.indexOf(attemptingNick) < 0) {
			return callback(null, attemptingNick);
		}
		
		while (i <= 10) {
			if (ids.indexOf(attemptingNick) < 0) {
				break;
			}
			attemptingNick = suggestion + i;
			i++;
		}

		if (i === 10) {
			return generateNick("", callback);
		}
		
		callback(null, attemptingNick);
	});
}

function generatePick(id) {
	return "https://gravatar.com/avatar/" + crypto.createHash("md5").update(id).digest("hex") + "/?d=retro";
}


function initializerUser(action, callback) {
	var userObj;
	generateNick(action.suggestedNick || action.ref || "", function(err, nick) {
		if (err) {
			return callback(err);
		}
		
		nick = "guest-" + nick;
		if (!action.ref) {
			action.from = nick;
		}
		
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
		
		if(!err && data && data.results && data.results.length) {
			old = data.results[0];
		}
		
		// Yes, these conditions can be combined and improved but this is more readable.
		function shouldInitialize() {
			if(!old) return true;
			if (!action.suggestedNick) return false;
			if(!old.params || !old.params.isSuggested) return true;
			if(action.suggestedNick === old.params.requestedNick) return false;
			
			if(action.origin && action.origin.protocol === "http:"){
				if(action.origin.host === old.params.assignedBy) return true;
				else return false;
			}
			
			return true;
		}
		
		if (shouldInitialize()) {
			return initializerUser(action, function() {
				if (action.suggestedNick) {
					if(!action.user.params) action.user.params = {};
					action.user.params.isSuggested = true;
					action.user.params.assignedBy = action.origin.host;
					action.user.params.requestedNick = action.suggestedNick;
				}
				if(old) action.old = old;
					
				return callback();
			});
		} else {
			action.user = old;
			return callback();
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
	if (!userUtils.isGuest(userID)) {
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
