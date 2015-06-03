var crypto = require('crypto') /*, log = require("../lib/logger.js")*/ ;
var names = require('../lib/generate.js').names;
var utils = require('../lib/app-utils.js');
var mathUtils = require('../lib/math-utils.js');
var uid = require('../lib/generate.js').uid;
var config;
var _ = require('underscore');
var log = require('../lib/logger.js');
/* list of event that the basic validation function is called for.*/
var core, events = ['text', 'edit', 'join', 'part', 'away', 'back', 'admit', 'expel', 'room'];

var handlers = {
	room: function(action, callback) {
		action.room.createTime = action.old.createTime? action.old.createTime: action.room.createTime;
		callback();
	},
	user: function(action, callback) {
		action.user.createTime = action.old.createTime? action.old.createTime: action.user.createTime;
		callback();
	},
	text: function(action, callback) {
		var text = action.text;
		var mentions = [],
			users;

		action.mentions = action.mentions || [];

		core.emit('getUsers', {
			session: "internal-loader",
			memberOf: action.to
		}, function(membersError, members) {
			core.emit('getUsers', {
				session: "internal-loader",
				occupantOf: action.to
			}, function(occupantsError, occupants) {
				members = membersError? [] : members.results;
				occupants = occupantsError? []: occupants.results;
				users = members.concat(occupants);
								
				users = users.map(function(u) {
					if (/guest-/.test(u.id)) u.id = u.id.replace('guest-', '');
					return u.id;
				});

				users = _.uniq(users, function(item) {
					return item;
				}); // unique memeber + occupant ids

				mentions = text.split(" ").map(function(word) {
					if (((/^@[a-z][a-z0-9\_\-\(\)]{2,32}[:,]?$/i).test(word) || (/^[a-z][a-z0-9\_\-\(\)]{2,32}:$/i).test(word)) && _.contains(users, word.replace(/[@:]/, ''))) {
						return word.replace(/[@:]/, '');
					}
				});
				mentions.concat(action.mentions);
				mentions = _.uniq(mentions, function(m) {
					return m;
				});
				action.mentions = _.compact(mentions);
				action.members = members;
				action.occupants = occupants;
				callback();
			});
		});
	},
	edit: function(action, callback) {
		core.emit("getTexts", {
			id: uid(),
			ref: action.ref,
			to: action.room.id,
			session: "internal-loader"
		}, function(err, actions) {
			if (err || !actions || !actions.results || !actions.results.length) return callback(new Error("TEXT_NOT_FOUND"));
			action.old = actions.results[0];
			/*
				TODO: load user and room from here. Uncomment and test.
				action.user = actions.user;
				action.room = actions.room;
			 */
			callback();
		});
	},
	admit: loadVictim,
	expel: loadVictim
};

function loadVictim(action, callback) {
	log.d("Entity Loader:", action);
	if (action.ref) {
		core.emit("getUsers", {
			ref: action.ref,
			session: action.session
		}, function(err, data) {
			if (err || !data || !data.results || !data.results.length) {
				return callback(new Error("user " + action.ref + " not found"));
			}
			action.victim = data.results[0];
			callback();
		});
	} else {
		callback();
	}
}
module.exports = function(c, conf) {
	core = c;
	config = conf;
	events.forEach(function(event) {
		core.on(event, function(action, callback) {
			if (action.user) delete action.user;
			basicLoader(action, function(err) {
				if (err) return callback(err);
				action.from = action.user.id;
				action.to = action.room.id;
				if (handlers[event]) handlers[event](action, callback);
				else callback();
			});
		}, "loader");
	});
	core.on('getUsers', loadUser, "loader");
	core.on('getRooms', loadUser, "loader");
	core.on('getTexts', basicLoader, "loader");
	core.on('init', loadProps, 500);
	core.on('getThreads', function(action, cb) {
		if (action.to) basicLoader(action, cb);
		else {
			return loadUser(action, cb);
		}
	}, "loader");
	core.on("init", initHandler, "loader");
	core.on("user", function(action, next) {
        userHandler(action, function(err) {
            if(err) return next(err);
            else handlers.user(action, next);
        });
    }, "loader");
};

function userHandler(action, callback) {
	var ref;

	if(utils.isInternalSession(action.session)) {
		ref = action.user.id;
	}else{
		ref = "me";
	}
	core.emit("getUsers", {ref: "me", session: action.session}, function(err, data){
		function done() {
			if(action.user.identities) {
				if(!action.user.picture) action.user.picture = 'https://gravatar.com/avatar/' +	crypto.createHash('md5').update(action.user.identities[0].substring(7)).digest('hex') + '/?d=retro';
			}else {
				action.user.picture = 'https://gravatar.com/avatar/default';
			}
			action.user.description = action.user.description || "";
			callback();
		}
		if (err || !data || !data.results || !data.results.length) {
			return callback(new Error("USER_NOT_INITED"));
		} else {
			action.from = data.results[0].id;
			core.emit("getUsers", {
				ref: action.user.id,
				session: "internal-loader"
			}, function(err, data) {
				if (utils.isGuest(action.from)) { // signup
					if (data && data.results && data.results.length) {
						return callback(new Error("ERR_USER_EXISTS"));
					}
				} else {
					if (!data || !data.results || !data.results.length) return callback(new Error("ERR_SAVING"));
					action.old = data.results[0]; // letting the authorized take care of things.
					return done();
				}
				core.emit("getRooms", {
					session: "internal-loader",
					ref: action.user.id
				}, function(err, rooms) {
					if (rooms && rooms.results && rooms.results.length) {
						return callback(new Error("ERR_USER_EXISTS"));
					}
					action.old = {};
					done();
				});

			});
		}
	});
}


function initHandler(action, callback) {
	core.emit("getUsers", {
		id: uid(),
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
			if(user.isSuggested) return (action.origin.domain === action.user.assignedBy && action.suggestedNick != action.user.requestedNick);
			else return true;
		}
		if (action.suggestedNick && utils.isGuest(action.user.id) && allowSuggested(data.results[0])) {
			return initializerUser(action, function() {
				action.user.isSuggested = true;
				action.user.assignedBy = action.origin.domain;
				action.user.requestedNick = action.suggestedNick;
				action.old = old;
				return callback();
			});
		} else if (action.ref && utils.isGuest(data.results[0].id)) {
			core.emit("getUsers", {
				id: uid(),
				ref: action.ref,
				session: action.session
			}, function(err, data) {
				if (err || !data || !data.resutls || !data.results.length) {
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


function loadUser(action, callback) {
	if (action.ref == "me") return callback();
	if (utils.isInternalSession(action.session)) {
		action.user = {
			id: "system",
			role: "owner" // should look for alternatives.
		};
		return callback();
	}

	core.emit("getUsers", {
		id: uid(),
		ref: "me",
		session: action.session
	}, function(err, data) {
		var user;
		if (err || !data || !data.results || !data.results.length) {
			return callback(new Error("USER_NOT_INITED"));
		} else {
			user = data.results[0];
			if ((action.type && events.indexOf(action.type) >= 0) || action.type == "init") action.from = data.results[0].id;
			if (action.type == "user") {
				action.old = data.results[0];
			} else if (!/guest-/.test(user.id) && action.to) {
				core.emit("getUsers", {
					id: uid(),
					session: action.session,
					ref: user.id,
					memberOf: action.to
				}, function(err, data) {
					if (err || !data || !data.results || !data.results.length) {
						action.user = user;
						if (!action.user.role) action.user.role = "registered";
						callback();
					} else {
						action.user = data.results[0];
						callback();
					}
				});
			} else {
				action.user = user;
				action.user.role = "guest";
				callback();
			}
		}
	});
}

function loadRoom(action, callback) {
	core.emit("getRooms", {
		id: uid(),
		ref: action.to,
		session: "internal-loader"
	}, function(err, rooms) {
		var room;
		if (err || !rooms || !rooms.results || !rooms.results.length) {
			if (action.type != "room") return callback(new Error("NO_ROOM_WITH_GIVEN_ID"));

			core.emit("getUsers", {
				session: "internal-loader",
				ref: action.to
			}, function(err, users) {
				if (users && users.results && users.results.length) {
					return callback(new Error("NOT_A_ROOM"));
				}
				action.old = {};
				return callback();
			});
		} else {
			room = rooms.results[0];
			if (action.type == "room") {
				if (room && room.id) action.old = room;
				else action.old = {};
			} else {
				action.room = room;
			}
			callback();
		}
	});
}

function basicLoader(action, callback) {
	loadUser(action, function(err) {
		if (err) return callback(err);
		loadRoom(action, function(err) {
			return callback(err);
		});
	});
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

function generateNick(suggestedNick, callback) {
	var lowBound = 1, upBound = 1;
	if (!suggestedNick) suggestedNick = names(6);
	suggestedNick = suggestedNick.toLowerCase();


	function checkUser(suggestedNick, attemptC, callback) {
		var ct = 0, result = true;
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
				if (data && data.results && data.results.length > 0) {
					done(false);
				}  else {
					done(true);
				}
			});
		}
		checkRoomUser("getRooms", trying);
		checkRoomUser("getUsers", trying);
		checkRoomUser("getUsers", "guest-" + trying);

	}
	checkUser(suggestedNick, 0, callback);
}

function generatePick(id) {
	return 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(id).digest('hex') + '/?d=retro';
}



 function  loadProps(action, callback) {
	var wait = true, userID = action.user.id;
	log("Loading user content", action.user.id);
	core.emit("getRooms", {
		id: uid(),
		hasOccupant: userID,
		session: action.session
	}, function(err, rooms) {
		if (err || !rooms || !rooms.results || !rooms.results.length) {
			action.occupantOf = [];
		} else {
			action.occupantOf = rooms.results;
		}
		log("Loading user content: occupants", rooms.results);
		if (wait) wait = false;
		else callback();
	});
	if(!utils.isGuest(userID)) {
		core.emit("getRooms", {
			id: uid(),
			hasMember: userID,
			session: action.session
		}, function(err, rooms) {
			if (err || !rooms || !rooms.results || !rooms.results.length) {
				action.memberOf = [];
			} else {
				action.memberOf = rooms.results;
			}
			log("Loading user content: members", rooms.results);
			if (wait) wait = false;
			else callback();
		});
	}else{
		action.memberOf = [];
		if (wait) wait = false;
		else callback();
	}
}
