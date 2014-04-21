var crypto = require('crypto'), log = require("../lib/logger.js");
var names = require('../lib/generate.js').names;
var uid = require('../lib/generate.js').uid;
var config = require("../config.js");
var internalSession = Object.keys(config.whitelists)[0];

/* list of event that the basic validation function is called for.*/
var core, events = ['text', 'edit', 'join', 'part', 'away', 'back', 'admit', 'expel', 'room'];

var handlers = {
	init: function(action, callback) {
		var wait = true, isErr = false;

		core.emit("getRooms",{id: uid(),hasOccupant: action.from, session: action.session},function(err, rooms) {
			var user = {};
			if(err || !rooms || !rooms.length || !rooms.results.length) {
				action.occupantOf = [];
			}else {
				action.occupantOf = rooms.results;
			}
			
			// if(isErr) return;
			if(wait) wait = false;
			else callback();
		});

		core.emit("getRooms",{id: uid(), hasMember: action.from, session: action.session}, function(err, rooms) {
			if(err || !rooms ||!rooms.results || !rooms.results.length) {
				action.memberOf = []
			}else{
				action.memberOf = rooms.results;	
			}
			// if(isErr) return;
			if(wait) wait = false;
			else callback();
		});
	},
	edit: function(action, callback) {
		core.emit("getTexts", {id: uid(),ref: action.ref}, function(err, actions) {
			if(err || !actions || !actions.results || !actions.results.length) return callback(new Error("TEXT_NOT_FOUND"));
			action.old = actions.results[0];
			callback();
		});
	},
	room: function(action, callback) {
		core.emit("getRooms", {ref: action.to}, function(err, data) {
			if(err) return callback(err);
			if(!data || !data.results || !data.results.length) {
				action.old = {};
			}else {
				action.old = data.results[0];
			}
			callback();
		});
	},
	admit: loadVictim,
	expel: loadVictim
};

function loadVictim(action, callback) {
	if(action.ref) {
		core.emit("getUsers", {ref: action.ref, session: action.session}, function(err, data){
			if(err || !data || !data.resulats || !data.results.length) {
				return callback(new Error("user "+action.ref+ " not found"));
			}
			action.victim = data.results[0];
		});
	}else{
		callback();
	}
}
module.exports = function(c) {
	core = c;
	events.forEach(function(event) {
		core.on(event, function(action, callback) {
			if(action.user) delete action.user;
			basicLoader(action, function(err) {
				if(err) return callback(err);
				action.from = action.user.id;
				action.to = action.room.id;
				if(handlers[event]) handlers[event](action, callback);
				else callback();
			});
		}, "loader");
	})

	core.on('getUsers', function(query, callback) {
		if(query.ref == "me") return callback();
		if(config.whitelists[query.session]) {
			query.user = {
				id: "system"
			}
			return callback();
		}

		core.emit("getUsers", {session: query.session, ref: "me"}, function(err, user) {
			if(err || !user || !user.results || !user.results.length) {
				query.results = [];
				callback();
			}else {
				query.user = user[0];
				callback();
			}
		});
	}, "loader");
	core.on('getRooms', function(query, callback) {
		if(config.whitelists[query.session]) {
			query.user = {
				id: "system"
			}
			return callback();
		}
		core.emit("getUsers", {session: query.session, ref: "me"}, function(err, user) {
			if(err || !user || !user.results || !user.results.length) {
				query.results = [];
				callback();
			}else {
				query.user = user[0];
				callback();
			}
		});
	}, "loader");


	core.on("init", function(action, callback) {
		function done() {
			handlers["init"](action, callback);
		}
		core.emit("getUsers",{id: uid(), ref: "me", session: action.session}, function(err, data) {
			if(err || !data || !data.results || !data.results.length) {
				return initializerUser(action, function() {
					if(action.suggestedNick) action.user.nickAssigned = true;
					return done();
				});
			}else {
				action.user = data.results[0];
			}

			if(action.suggestedNick && /^guest-/.test(action.user.id) && !data.results[0].nickAssigned) {
				return initializerUser(action, function() {
					action.user.isSuggested = true;
					return done();
				});	
			}
			else if(action.ref && /^guest-/.test(data.results[0].id)) {
				core.emit("getUsers",{id: uid(), ref: action.ref, session: action.session}, function(err, data) {
					if(err || !data || !data.resutls || !data.results.length) {
						return callback(new Error("NICK_TAKEN"));
					}else {
						initializerUser(action, function() {
							done();
						});
					}
				});
			}else{
				done();
			}
		});	
	}, "loader");
}


function loadUser(action, callback) {
	core.emit("getUsers",{id: uid(), ref: "me", session: action.session}, function(err, data) {
		var user;
		if(err || !data || !data.results || !data.results.length) {
			return callback(new Error("USER_NOT_INITED"));
		}else {
			user = data.results[0]
			action.from = data.results[0].id;
			if(action.type == "user") {
				action.old = data.results[0];
			}else if(!/guest-/.test(user.id)){
				core.emit("getUsers", {id: uid(), session: action.session, ref: user.id, memberOf: action.to}, function() {
					if(err || !data || !data.results || !data.results.length) {
						action.user = user;
						callback();
					}else {
						action.user = data.results[0];
						callback();
					}
				});
			}else{
				action.user = user
				callback();	
			}
		}
	});
}

function loadRoom(action, callback) {
	core.emit("getRooms",{id: uid(), ref: action.to, session: action.session}, function(err, rooms) {
		var room;
		if(err || !rooms ||!rooms.results || !rooms.results.length) {
			if(action.type != "room") return callback(new Error("NO_ROOM_WITH_GIVEN_ID"));
		}else{
			room = rooms.results[0];	
		}

		if(action.type == "room") {
			if(room.id) action.old = room;
			else action.old = {}
		}else {
			action.room = room;
		}
		callback();
	});
}

function basicLoader(action, callback) {
	loadUser(action, function(err) {
		if(err) return callback(err);
		loadRoom(action, function(err) {
			return callback(err);
		});
	});
}

function initializerUser(action, callback) {
	var userObj;
	generateNick(action.suggestedNick || action.ref || "", function(possibleNick) {
		possibleNick = "guest-"+possibleNick;
		if(!action.ref) action.from = possibleNick;
		userObj = {
			id: possibleNick,
			description: "",
			createdOn: new Date().getTime(),
			type:"user",
			params:{},
			timezone:0,
			sessions: [action.session],
			picture: generatePick(possibleNick)
		};
		action.user = userObj;
		callback();
	});
}

function generateNick(suggestedNick, callback) {
	if(!suggestedNick) suggestedNick = names(6);
	function checkUser(suggestedNick, attemptC ,callback) {
		var trying = suggestedNick;
		if(attemptC) trying+=attemptC;
		if(attemptC>=3) return callback(names(6));
		core.emit('getUsers', {ref:"guest-"+trying, session: internalSession},function(err, data) {
			if(data && data.results && data.results.length >0){
				return checkUser(suggestedNick, attemptC+1, callback);
			}
			core.emit('getUsers', {ref:trying, session: internalSession},function(err, data) {
				if(data && data.results && data.results.length >0){
					return checkUser(suggestedNick, attemptC+1, callback);
				}
				core.emit('getRooms', {ref:trying, session: internalSession},function(err, data) {
					if(data && data.results && data.results.length >0) {
						return checkUser(suggestedNick, attemptC+1, callback);
					}
					callback(trying);
				});
			})
		});
	}
	checkUser(suggestedNick, 0, callback);
}

function generatePick(id) {
	return 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(id).digest('hex') + '/?d=identicon&s=48';
}


