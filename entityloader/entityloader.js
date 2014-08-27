var crypto = require('crypto')/*, log = require("../lib/logger.js")*/;
var names = require('../lib/generate.js').names;
var uid = require('../lib/generate.js').uid;
var config = require("../config.js");
var internalSession = Object.keys(config.whitelists)[0];
var _ = require('underscore');

/* list of event that the basic validation function is called for.*/
var core, events = ['text', 'edit', 'join', 'part', 'away', 'back', 'admit', 'expel', 'room'];

var handlers = {
	init: function(action, callback) {
		var wait = true;

		core.emit("getRooms",{id: uid(),hasOccupant: action.user.id, session: action.session},function(err, rooms) {
			if(err || !rooms || !rooms.results || !rooms.results.length) {
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
				action.memberOf = [];
			}else{
				action.memberOf = rooms.results;
			}
			// if(isErr) return;
			if(wait) wait = false;
			else callback();
		});
	},
	text: function(action, callback) {
		var text = action.text;
		var mentions = [], users;
		
		action.mentions = action.mentions || [];
		
		core.emit('getUsers', {session: internalSession, memberOf: action.to}, function(err, members){
			core.emit('getUsers', {session: internalSession, occupantOf: action.to}, function(err, occupants){
				members = members.results;
				occupants = occupants.results;
				users = members.concat(occupants);
				
				users = users.map(function(u){
					if(/guest-/.test(u.id)) u.id = u.id.replace('guest-', '');
					return u.id;
				});
				
				users = _.uniq(users, function(item){
					return item;
				}); // unique memeber + occupant ids
				
				mentions = text.split(" ").map(function(word){
					if (((/^@[a-z][a-z0-9\_\-\(\)]{2,32}[:,]?$/i).test(word) || (/^[a-z][a-z0-9\_\-\(\)]{2,32}:$/i).test(word)) && _.contains(users, word.replace(/[@:]/, ''))){
						return word.replace(/[@:]/, '');
					}
				});
				mentions.concat(action.mentions);
				mentions = _.uniq(mentions, function(m){
					return m;
				});
				action.mentions = _.compact(mentions);
			});
		});
		callback();
	},
	edit: function(action, callback) {
		core.emit("getTexts", {id: uid(),ref: action.ref, to: action.room.id, session: internalSession}, function(err, actions) {
			if(err || !actions || !actions.results || !actions.results.length) return callback(new Error("TEXT_NOT_FOUND"));
			action.old = actions.results[0];
			callback();
		});
	},
	admit: loadVictim,
	expel: loadVictim
};

function loadVictim(action, callback) {
	if(action.ref) {
		core.emit("getUsers", {ref: action.ref, session: action.session}, function(err, data) {
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
	});
	core.on('getUsers', loadUser, "loader");
	core.on('getRooms', loadUser, "loader");
	core.on('getTexts', basicLoader, "loader");
	core.on('getThreads',function(action, cb) {
		if(action.to) basicLoader(action, cb);
		else{
			return loadUser(action, cb);
		}
	}, "loader");
	core.on("init", initHandler, "loader");
	core.on("user", userHandler, "loader");
};

function userHandler(action, callback) {
	core.emit("getUsers", {ref: "me", session: action.session}, function(err, data){
		function done() {
			if(action.user.identities) action.user.picture = 'https://gravatar.com/avatar/' +	crypto.createHash('md5').update(action.user.identities[0].substring(7)).digest('hex') + '/?d=monsterid';
			else action.user.picture = 'https://gravatar.com/avatar/default';
			action.user.description = action.user.description || "";
			callback();
		}
		if(err || !data || !data.results || !data.results.length) {
			return callback(new Error("USER_NOT_INITED"));
		}else {
			action.from = data.results[0].id;
			core.emit("getUsers", {ref: action.user.id, session: internalSession}, function(err, data) {
                if(/^guest-/.test(action.from)) { // signup
                    if(data && data.results && data.results.length) {
                        return callback(new Error("ERR_USER_EXISTS"));
                    }
                }else {
                    if(!data || !data.results || !data.results.length) return callback(new Error("ERR_SAVING")); 
                    action.old = data.results[0]; // letting the authorized take care of things.
                    return done();
                }
                core.emit("getRooms", {session: internalSession, ref: action.user.id}, function(err, rooms){
                    if(rooms && rooms.results && rooms.results.length) {
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
	function done() {
		handlers.init(action, callback);
	}
	core.emit("getUsers",{id: uid(), ref: "me", session: action.session}, function(err, data) {
		if(err || !data || !data.results || !data.results.length) {
			return initializerUser(action, function() {
				if(action.suggestedNick) action.user.isSuggested = true;
				return done();
			});
		}else {
			action.user = data.results[0];
		}
		console.log("INIT so far", action.user);
		if(action.suggestedNick && /^guest-/.test(action.user.id) && !data.results[0].isSuggested) {
			return initializerUser(action, function() {
				action.user.isSuggested = true;
				return done();
			});
		}else if(action.ref && /^guest-/.test(data.results[0].id)) {
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
}


function loadUser(action, callback) {
	if(action.ref == "me") return callback();
	if(config.whitelists[action.session]) {
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
	}, function (err, data) {
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
	            }, function (err, data) {
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
	});}

function loadRoom(action, callback) {
    core.emit("getRooms", {
        id: uid(),
        ref: action.to,
        session: internalSession
    }, function (err, rooms) {
        var room;
        if (err || !rooms || !rooms.results || !rooms.results.length) {
            if (action.type != "room") return callback(new Error("NO_ROOM_WITH_GIVEN_ID"));

            core.emit("getUsers", {
                session: internalSession,
                ref: action.to
            }, function (err, users) {
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
			createTime: new Date().getTime(),
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
    suggestedNick = suggestedNick.toLowerCase();
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
			});
		});
	}
	checkUser(suggestedNick, 0, callback);
}

function generatePick(id) {
	return 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(id).digest('hex') + '/?d=wavatar';
}


