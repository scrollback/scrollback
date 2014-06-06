var assert = require("assert");
var config  = require('../config.js');
var core = require("../lib/emitter.js");
var ircSb = require("./irc.js");
var gen = require("../lib/generate.js");
var irc = require('irc');
var guid = gen.uid;
var names = gen.names;
var client;
var testingServer = "dev.scrollback.io";
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
			server: testingServer,
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
			server: testingServer,
			channel: "#testingroom",
			enabled: true,
			pending: false
		}
	}}
];
describe('connect new IRC channel', function() {
	before( function(done) {
		this.timeout(5*40000);
		core.on('getUsers', function(v, callback) {
			v.results = users;
			callback(null, v);
		});
		core.on("getRooms", function(q, callback) {
			q.results = rooms;
			callback(null, q);
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
			if(!text.session) text.session = "irc://" + rooms[0].params.irc.server + ":" + "test";
			callback();
		}, "modifier");
		core.on('back', function(text, callback) {
			console.log("text called irc test:", text);
			text.room = rooms[0];
			if(!text.session) text.session = "irc://" + rooms[0].params.irc.server + ":" + "test";
			callback();
		}, "modifier");
		core.on('away', function(text, callback) {
			console.log("text called irc test:", text);
			text.room = rooms[0];
			if(!text.session) text.session = "irc://" + rooms[0].params.irc.server + ":" + "test";
			callback();
		}, "modifier");
		client = new irc.Client(testingServer, "testingbot", {
			channels: ["#scrollback", "#testingroom", "#testingroom2"]
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
			console.log("get message from irc:", to, from, message);
			var a = qu.indexOf(message);
			if (a != -1) {
				qu.splice(a, 1);
			}
			if(qu.length === 0) {
				done();
			}
		});
		console.log("running Test");
		
		for(var i = 0;i < 8;i++) {
			var text = guid();
			qu.push(text);
			core.emit("back", {
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
				text: text,
				session: "web://outuser"  + i
			});
			
		}
	});
	
	it("receiving messages from irc user", function(done) {
		this.timeout(1000*60);//1 min
		var msg = guid();
		core.on('text', function(text, callback) {
			if (text.type === 'text' && text.from == "c" + client.nick && text.to === "scrollback" && text.text === "this is testing message id=" + msg) {
				done();
			}
			callback();
		});
		client.say("#scrollback", "this is testing message id=" + msg);
		
	});
	
	it("away message test", function(done) {
		this.timeout(1000*60);
		client.on("part", function(channel, nick, reason, message){
			if (nick === 'outuser0' && channel == "#scrollback") {
				done();
			}
		});
		core.emit('away', {
			type: "away",
			to: "scrollback",
			from: "outuser0",
			session: "web://outuser0"
		});
		
	});
	
	it("Adding new Room", function(done) {
		console.log("Running new room");
		//client.
		this.timeout(60 * 1000);
		core.emit("room", {
			type: "room",
			session: "web://somesession",
			room: {
				id: "testingroom2",
				params: {
					irc: {
						server: testingServer,
						channel: "#testingroom2",
						pending: false,
						enabled: true
					}
				}
			}
		}, function(err, room) {
			console.log("room is connected now");
			done();
		});
		
		
	});
	
	
	
	it("Update Old room", function(done) {
		console.log("Running new room should disconnect from #testingroom2 and connect to #testingroom3");
		//client.
		this.timeout(60 * 1000);
		core.emit("room", {
			
			type: "room",
			room: {
				id: "testingroom2",
				params: {
					irc: {
						server: testingServer,
						channel: "#testingroom3",
						pending: false,
						enabled: true
					}
				}
			},
			old: {
				id: "testingroom2",
				type: "room",
				params: {
					irc: {
						server: testingServer,
						channel: "#testingroom2",
						pending: false,
						enabled: true
					}
				}
				
			},
			session: "web://somesession"
		}, function(room) {
			console.log("room is connected now");
			done();
		});
		
		
	});
	

});
