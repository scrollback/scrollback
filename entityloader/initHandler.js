"use strict";
var crypto = require('crypto') /*, log = require("../lib/logger.js")*/ ;
var utils = require('../lib/app-utils.js');
var names = require('../lib/generate.js').names;
var mathUtils = require('../lib/math-utils.js');

var core, config;

function checkRoomUser(list, done) {
	core.emit("getEntities", {
		ref: list,
		session: "internal-loader"
	}, function(err, data) {
		if (!err && data && data.results && data.results.length > 0) {
			done(false);
		} else {
			done(true);
		}
	});
}

function generateNick(sNick, next) {
	var lowBound = 1,
		upBound = 1;
	if (!sNick) sNick = names(6);
	sNick = sNick.toLowerCase();


	function checkUser(suggestedNick, attemptC, callback) {
		var trying = suggestedNick;

		if (attemptC) {
			lowBound = upBound;
			upBound = 1 << attemptC;
			trying += mathUtils.random(lowBound, upBound);
		}

		if (attemptC >= config.nickRetries) return callback(names(6));



		checkRoomUser([trying, "guest-" + trying], function(result) {
			if (result) {
				callback(trying);
			} else {
				checkUser(suggestedNick, attemptC + 1, callback);
			}
		});
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
