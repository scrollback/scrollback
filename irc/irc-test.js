var assert = require("assert");
var config  = require('../config.js');
var core = require("../lib/emitter.js");
var irc = require("./irc.js");
var gen = require("../lib/generate.js");
var guid = gen.uid;
var names = gen.names;
var msg = {id:guid(), text: "values : " + Math.random(), from : "guest-" + names(6), to: "scrollback", type: 'text', time: new Date().getTime()};
var users = [
	{
		id: 'abc123',
		type: "user"
	},
	{
		id: 'test',
		type: "user"
	}
];
var rooms = [{
	id: "scrollback",
	type: "room",
	params: {
		irc: {
			server: "localhost",
			channel: "#scrollback",
			enabled: true,
			pending: false
		}
	}
}, {
	id: "testingRoom",
	type: "room",
	params: {
		irc: {
			server: "localhost",
			channel: "#testingRoom",
			enabled: true,
			pending: true
		}
	}
}];
describe('connect new IRC channel', function() {
	before( function(done) {
		this.timeout(40000);
		core.on('getUsers', function(v, callback) {
			v.results = users;
			callback(v);
		});
		core.on("getRooms", function(q, callback) {
			q.results = rooms;
			callback(q);
		});
		core.on('init', function(init, callback) {
			init.user = {
				id: "c" + init.suggestedNick,
				type: "user"
			};
			callback(init);
		});
		core.on('text', function(text, callback) {
			console.log("text called irc test:", text);
			text.room = rooms[0];
			if(!text.session) text.session = "ircClient://" + rooms[0].params.irc.server + ":" + "test";
			callback();
		}, "cache");
		irc(core);
		setTimeout(function(){
			done();		
		}, 30000);
	});
	it('Single room test new IRC config.', function(done) {
		this.timeout(30000);
		console.log("running Test");
		
		for(var i = 0;i < 4;i++) {
			core.emit("text", {
				type: 'back',
				to: "scrollback",
				room: rooms[0],
				from: "outUser" + i,
				session: "web://outuser" 
			});
			core.emit("text", {
				type: 'text',
				to: "scrollback",
				from: "outUser" + i,
				text: "this is message from outUser" + i,
				session: "web://outuser" 
			});
		}
	});
	
	
});
