var config = require('../config.js');
var core = new (require('../lib/emitter.js'))();
var ircSb = require("./irc.js");
var gen = require("../lib/generate.js");
var irc = require('irc');
var guid = gen.uid;
var client;
var testingServer = "dev.scrollback.io";
var botName = require('../ircClient/config.js').botNick;

/**
 * All test cases should run in sequence
 * Do not change the order of test cases.
 * config.irc.debug should be true to run test cases
 * some test cases are based on timeouts so might fail on slow network. 
 */
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
	identities: [],
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
    identities: [],
	params: {
		irc: {
			server: testingServer,
			channel: "#testingroom",
			enabled: true,
			pending: false
		}
	}}
];
describe('IRC test: ', function() {//this will connect 2 rooms scrollback and testingroom
	before( function(done) {
		this.timeout(5*40000);
		if (!config.irc.debug) throw new Error("config.irc.debug should be true to run test. Edit myConfig.js and try again");
        core.on('getUsers', function(v, callback) {
			v.results = users;
			callback(null, v);
		}, 500);
		core.on("getRooms", function(q, callback) {
			q.results = rooms;
			callback(null, q);
		}, 500);
		core.on('init', function(init, callback) {
			init.user = {
				id: "c" + init.suggestedNick,
				type: "user"
			};
			callback(init);
		}, 500);
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
			channels: ["#scrollback", "#testingroom", "#testingroom2", "#testingroom3"]
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
		}, 500);
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
		client.on("join#testingroom2", function() {
			done();
		});
		core.emit("room", {
			type: "room",
			session: "web://somesession",
			room: {
                identities: [],
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
			console.log("room is connected now", err, room);
		});
	});
	
	
	
	it("Update Old room", function(done) {
		console.log("Running new room should disconnect from #testingroom2 and connect to #testingroom3");
		//client.
		this.timeout(60 * 1000);
		var c = 0;
		function go() {
			if (c == 2) {
				done();
			}
		}
		client.on("join#testingroom3", function() {
			c++;
			go();
		});
		core.emit("room", {
			type: "room",
			room: {
                identities: [],
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
			//TODO test if bot joined the room.
			console.log("room is connected now");
			c++;
			go();
		});
		
		
	});
	
	it("Disconnect All rooms", function(done) {
		this.timeout(60 * 1000);
		var c = 0;
		client.on("part", function(channel, nick, reason, message) {
			if(nick.indexOf(botName) != -1) c++;
			go();
		});
		client.on("quit", function(channel, nick, reason, message) {
			if(nick.indexOf(botName) !== -1) c++;
			go();
		});
		function go() {
			if (c === 6) {
				setTimeout(done, 3000);//Bot diconnection will take some time.
			}
		}
		core.emit("room", {
			type: "room",
			old: {
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
			room: {
                identities: [],
				id: "testingroom2",
				type: "room",
				params: {
					irc: {
						server: "",
						channel: "",
						pending: false,
						enabled: true
					}
				}
				
			},
			session: "web://somesession"
		}, function(err, room) {
			c++;
			go();
			console.log("Disconnected", arguments);
		});
		
		core.emit("room", {
			type: "room",
			old: {
				id: "scrollback",
				params: {
					irc: {
						server: testingServer,
						channel: "#scrollback",
						pending: false,
						enabled: true
					}
				}
			},
			room: {
                identities: [],
				id: "scrollback",
				type: "room",
				params: {
					irc: {
						server: "",
						channel: "",
						pending: false,
						enabled: true
					}
				}
				
			},
			session: "web://somesession"
		}, function(err, room) {
			c++;
			go();
			console.log("Disconnected", arguments);
		});
		core.emit("room", {
			type: "room",
			old: {
				id: "testingroom",
				params: {
					irc: {
						server: testingServer,
						channel: "#testingroom",
						pending: false,
						enabled: true
					}
				}
			},
			room: {
				id: "testingroom",
				type: "room",
                identities: [],
				params: {
					irc: {
						server: "",
						channel: "",
						pending: false,
						enabled: true
					}
				}
				
			},
			session: "web://somesession"
		}, function(err, room) {
			c++;
			go();
			console.log("Disconnected", arguments);
		});

	});
	
	
	
	it("Bot left the server", function(done) {
		this.timeout(15 * 1000);
		client.on("error", function(err) {
			if (err.command === 'err_nosuchnick' && err.args[1] === botName) {
				done();
			}
			console.log("error:", err);
		});
		client.whois(botName, function(info) {
			console.log("whois", info);
		});

	});
    
    it("User left the server", function(done) {
		this.timeout(15 * 1000);
		client.on("error", function(err) {
			if (err.command === 'err_nosuchnick' && err.args[1] === "outuser0") {
				done();
			}
			console.log("error:", err);
		});
		client.whois("outuser0", function(info) {
			console.log("whois", info);
		});

	});
    

});
