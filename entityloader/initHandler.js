"use strict";
var crypto = require('crypto'); /*, log = require("../lib/logger.js")*/
var UserInfo = require('../lib/user-info.js');
var names = require('../lib/generate.js').names;
var mathUtils = require('../lib/math-utils.js');

var core, config;



function generateNick(sNick, next) {
	var lowBound = 1,
		upBound = 1;
	if (!sNick) sNick = names(6);
	sNick = sNick.toLowerCase();


	function checkUser(suggestedNick, attemptC, callback) {
		var ct = 0,
			result = true;
		var trying = suggestedNick;

		if (attemptC) {
			lowBound = upBound;
			upBound = 1 << attemptC;
			trying += mathUtils.random(lowBound, upBound);
		}

		if (attemptC >= config.nickRetries) return callback(names(6));

		function done(r) {
			result &= r;
			if (++ct >= 3) {
				if (result) {
					callback(trying);
				} else {
					checkUser(suggestedNick, attemptC + 1, callback);
				}
			}
		}

		function checkRoomUser(type, name) {
			core.emit(type, {
				ref: name,
				session: "internal-loader"
			}, function(err, data) {
				if (!err && data && data.results && data.results.length > 0) {
					done(false);
				} else {
					done(true);
				}
			});
		}
		checkRoomUser("getRooms", trying);
		checkRoomUser("getUsers", trying);
		checkRoomUser("getUsers", "guest-" + trying);

	}
	checkUser(sNick, 0, next);
}

function generatePick(id) {
	return 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(id).digest('hex') + '/?d=retro';
}


function initializerUser(action, callback) {
	var userObj;
	generateNick(action.suggestedNick || action.ref || "", function(possibleNick) {
		possibleNick = "guest-" + possibleNick;
		if (!action.ref) action.from = possibleNick;
		userObj = {
			id: possibleNick,
			description: "",
			createTime: new Date().getTime(),
			type: "user",
			params: {},
			timezone: 0,
			sessions: [action.session],
			picture: generatePick(possibleNick)
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
					action.user.assignedBy = action.origin.domain;
					action.user.requestedNick = action.suggestedNick;
				}
				return callback();
			});
		} else {
			old = action.user = data.results[0];
		}

		function allowSuggested(user) {
			if (user.isSuggested) return (action.origin.domain === action.user.assignedBy && action.suggestedNick !== action.user.requestedNick);
			else return true;
		}
		if (action.suggestedNick && new UserInfo(action.user.id).isGuest() && allowSuggested(data.results[0])) {
			return initializerUser(action, function() {
				action.user.isSuggested = true;
				action.user.assignedBy = action.origin.domain;
				action.user.requestedNick = action.suggestedNick;
				action.old = old;
				return callback();
			});
		} else if (action.ref && new UserInfo(data.results[0].id).isGuest()) {
			core.emit("getUsers", {
				ref: action.ref,
				session: action.session
			}, function(userError, response) {
				if (userError || !response || !response.resutls || !response.results.length) {
					return callback(new Error("NICK_TAKEN"));
				} else {
					initializerUser(action, function() {
						callback();
					});
				}
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
	if (!new UserInfo(userID).isGuest()) {
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



module.exports = function(c, conf) {
	core = c;
	config = conf;
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
