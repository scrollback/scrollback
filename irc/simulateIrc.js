/**
 * This is virtual irc client which will connect random users to dev.scrollback.io
 * and users will messages in the channel and  they will disconnect/part from the channel.
 * basically it will try to simulate irc behaviour.
 */
var channel = "#scrollback";
var irc = require("irc");
var ircClients = [];
var testingServer = "stage.scrollback.io";
var gen = require('../lib/generate.js');
var names = gen.names;
var sentence = gen.sentence;
var paragraph = gen.paragraph;

nextTime();

function nextTime() {
	next();
	var time = getRandom(11 * 1000, 50 * 1000);
	setTimeout(nextTime, time);
}


function next() {
	var i = 0;
	var client;
	var disCl;
	var tt = 10 * 1000;
	var noOfOp = getRandom(0, 100);
	console.log("total users:", ircClients.length, noOfOp);
	for (i = 0;i < noOfOp;i++) {
		var v = getRandom(0, 500);
		console.log("v=", v, i);
		tt = getRandom(250, 10 * 1000);
		if (v < Math.max(1, 100 - ircClients.length)) {
			console.log("connecting");
			setTimeout (function() {
				var ic = new irc.Client(testingServer, names(6), {
					channels: [channel],
					debug: true
				});
				ircClients.push(ic);
			}, tt);
		} else if (v >= 100 && v < 100 + ircClients.length) {
			if (ircClients.length !== 0) {
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
			}
		} else {
			if (ircClients.length !== 0) {
				setTimeout(function() {
					disCl = getRandom(0, ircClients.length - 1);
					client = ircClients[disCl];
					if(client) client.say(channel, sentence(getRandom(1, 20)));
				}, tt);
			}
		}
	}
}

function getRandom(a, b) {
	return Math.floor(Math.random() * (b - a + 1)) + a;
}
