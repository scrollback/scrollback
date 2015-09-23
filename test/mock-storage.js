"use strict";

var rooms = {
	"scrollback": {
		id: "scrollback",
		description: "this is room",
		type: "room",
		identities: ["irc://harry.scrollback.io/#scrollback"],
		timezone: 300,
		params: {},
		guides: {}
	}
};

var users = {
	"harish": {
		id: "harish",
		description: "this is harish",
		type: "user",
		identities: ["mailto:harish@scrollback.io"],
		timezone: 330,
		params: {},
		guides: {}
	},
	"manoj": {
		id: "manoj",
		description: "this is manoj",
		type: "user",
		identities: ["mailto:manoj@scrollback.io"],
		timezone: 330,
		params: {},
		guides: {}
	}
};


var threads = {
	some:{
		id:"dskjf34jkwebfjfdh"
	}
};

var texts ={
	one:{
		id:"kdflhjsdhj",
		thread:"dskjf34jkwebfjfdh",
		text:"helo manoj",
		from:"harish",
		to:"scrollback"
	}
};

module.exports = function(c) {
	var core = c;

	core.on("getUsers", function (obj, next) {
		process.nextTick(function(){
			obj.results = [users.harish];
			next();
		});
	});

	core.on("getEntities", function(query, next){
		process.nextTick(function(){
			query.results = [rooms.scrollback];
			next();
		});
	});

	core.on("getRooms", function (query, next) {
		process.nextTick(function(){
			query.results = [rooms.scrollback];
			next();
		});
	});

	core.on("getTexts", function (query, next) {
		process.nextTick(function(){
			query.results = [texts.one];
			next();
		});
	});

	core.on("getThreads", function (query, next) {
		process.nextTick(function(){
			query.results = [threads.some];
			next();
		});
	});
};
