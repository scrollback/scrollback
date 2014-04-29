var assert = require("assert");
var config  = require('../config.js');
var core = require("../lib/emitter.js");
var ircSb = require("./irc.js");
var gen = require("../lib/generate.js");
var irc = require('irc');
var guid = gen.uid;
var names = gen.names;
var client;
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
} ,{
	id: "testingroom",
	type: "room",
	params: {
		irc: {
			server: "localhost",
			channel: "#testingroom",
			enabled: true,
			pending: false
		}
	}}/*,
	{
	id: "nodejs",
	type: "room",
	params: {
		irc: {
			server: "chat.freenode.net",
			channel: "#node.js",
			enabled: true,
			pending: false
		}
	}},
	{
	id: "dogecoin",
	type: "room",
	params: {
		irc: {
			server: "chat.freenode.net",
			channel: "#dogecoin",
			enabled: true,
			pending: false
		}
	}}*/
];
describe('connect new IRC channel', function() {
	before( function(done) {
		this.timeout(5*40000);
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
		}, "modifier");
		client = new irc.Client("localhost", "testingBot", {
			channels: ["#scrollback", "#testingRoom"]
		});
		
		ircSb(core);
		setTimeout(function(){
			done();		
		}, 15000);
	});
	it('IRC message sending and receiving test.', function(done) {
		this.timeout(1000*60);
		var qu = [];
		client.on("message#", function(from, to, message) {
			console.log(to, from, message);
			var a = qu.indexOf(message);
			if (a != -1) {
				qu.splice(a, 1);
			}
			if(qu.length === 0) {
				done();
			}
		});
		console.log("running Test");
		
		for(var i = 0;i < 15;i++) {
			qu.push(guid());
			core.emit("text", {
				type: 'back',
				to: "scrollback",
				room: rooms[0],
				from: "outuser" + i,
				session: "web://outuser" 
			});
			core.emit("text", {
				type: 'text',
				to: "scrollback",
				from: "outuser" + i,
				text: qu[i],
				session: "web://outuser" 
			});
			
		}
	});
	
	
});
