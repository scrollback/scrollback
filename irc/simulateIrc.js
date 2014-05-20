/**
 * This is virtual irc client which will connect random users to dev.scrollback.io
 * and users will messages in the channel and  they will disconnect/part from the channel.
 * basically it will try to simulate irc behaviour. 
 */
var channel = "#testingroom";
var irc = require("irc");
var ircClients = [];
var testingServer = "dev.scrollback.io";
var gen = require('../lib/generate.js');
var names = gen.names;
var sentence = gen.sentence;
var paragraph = gen.paragraph;

nextTime();

function nextTime() {
	next();
	var time = getRandom(5 * 1000, 100 * 1000);
	setTimeout(nextTime, time);
}


function next() {
	var i = 0;
	var client;
	var disCl;
	var tt = 10 * 1000;
	var noOfOp = getRandom(0, 50);
	console.log("total users:", ircClients.length);
	for (i = 0;i < noOfOp;i++) {
		var op = getRandom(0, 2);
		console.log(i , op);
		tt = getRandom(250, 20 * 1000);
		switch(op) {
			case 0:
				console.log("connecting");
				
				setTimeout (function() {
					var ic = new irc.Client(testingServer, names(6), {
						channels: [channel]
					});
					ircClients.push(ic);
				}, tt);
				break;
			case 1:
				if (ircClients.length === 0) break;
				setTimeout(function() {
					disCl = getRandom(0, ircClients.length - 1);
					client = ircClients[disCl];
					if (client && client.connected) {
						console.log("parting user: ", client.nick);
						client.part(channel);
						client.disconnect();
						ircClients.splice(disCl, 1);
					}
				}, tt);
				
				break;
			case 2:
				if (ircClients.length === 0) break;
				setTimeout(function() {
					disCl = getRandom(0, ircClients.length - 1);
					client = ircClients[disCl];
					if(client) client.say(channel, sentence(getRandom(1, 40)));
				}, tt);
				break;
		}
		
	}
}

function getRandom(a, b) {
	return Math.floor(Math.random() * (b - a + 1)) + a;
}

