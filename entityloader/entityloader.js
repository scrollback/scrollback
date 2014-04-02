var crypto = require('crypto'), log = require("../lib/logger.js");
var names = require('../lib/generate.js').names;
var uid = require('../lib/generate.js').uid;


/* list of event that the basic validation function is called for.*/
var core, events = ['init','text', 'edit', 'join', 'part', 'away', 'admit', 'expel', 'room'];

/* if few more validtion is to be added for to any event add it to this list. eq:
	var handlers = {
		'init': function(action, callback){
			callback();
		}
	};
*/
var handlers = {
	init: function(action, callback) {
		var wait = true, isErr = false;
		if(!action.user){
			core.emit("getRooms",{id: uid(),hasoccupant: action.from},function(err, rooms) {
				var user = {};
				if(err) {
					action.occupantof = [];
				}
				if(!rooms.results.length) {
					action.occupantof = [];
				}
				if(isErr) return;
				action.user = rooms.results;
				if(wait) wait = false;
				else callback();
			});
		}else{
			wait = false;
		}
		core.emit("getRooms",{id: uid(), hasmember: action.from}, function(err, rooms) {
			if(err || !rooms ||!rooms.results || !rooms.results.length) {
				action.memberof = []
			}else{
				action.memberof = rooms.results;	
			}
			if(isErr) return;
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
	}
};

module.exports = function(c) {
	core = c;
	events.forEach(function(event) {
		core.on(event, function(action, callback) {
			if(action.user) delete action.user;
			basicLoader(action, function(err) {
				if(err) return callback(err);
				if(handlers[event]) handlers[event](action, callback);
				else callback();
			})
		}, "loader");
	});
}


function loadUser(action, callback) {
	core.emit("getUsers",{id: uid(), ref: "me", session: action.session}, function(err, data) {
		if(err || !data || !data.results || !data.results.length) {
			initializerUser(action, function() {
				callback();
			});
		}else {
			action.from = data[0].user.id;
			if(action.type == "user") {
				action.old = data[0]
			}else{
				action.user = data[0]
			}
			callback();
		}
	});
}

function loadRoom(action, callback) {
	core.emit("getRooms",{id: uid(), ref: action.to, session: action.session}, function(err, rooms) {
		var room;
		if(err || !rooms ||!rooms.results || !rooms.results.length) {
			room = {}
		}else{
			room = rooms.results[0];	
		}


		if(action.type == "room") {
			if(room.id) action.old = room;
			else action.old = {}
		}else {
			if(room.id) action.room = room;
			else action.room = {id: action.to}
		}
		callback();
	});
}

function basicLoader(action, callback) {
	loadUser(action, function() {
		loadRoom(action, function() {
			callback();
		});
	});
}

function initializerUser(action, callback) {
	var userObj;
	generateNick(action.suggestedNick || "", function(possibleNick) {
		action.from = possibleNick;
		userObj = {
			id: action.from,d
			description: "",
			createdOn: new Date().getTime(),
			type:"user",
			params:{},
			timezone:0,
			sessions: [action.session],
			picture: generatePick(action.from)
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
		core.emit('getUsers', {id:trying},function(err, data) {
			if(data && data.results && data.results.length >0) return checkUser(suggestedNick, attemptC+1, callback);
			core.emit('getRooms', {id:trying},function(err, data) {
				if(data && data.results && data.results.length >0) return checkUser(suggestedNick, attemptC+1, callback);
				callback('guest-'+trying);
			});
		})
	}
	checkUser(suggestedNick, 0, callback);
}

function generatePick(id) {
	return 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(id).digest('hex') + '/?d=identicon&s=48';
}