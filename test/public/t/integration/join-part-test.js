/* global describe it assert SockJS scrollback getConnection */ /* eslint no-console: 0, array-bracket-spacing: 0, no-param-reassign: 0 */
"use strict";
var timeOut = 3000;

describe("Action Join/Part: ", function() {

	var socket;
	it("Action JOIN: ", function(done) {
		this.timeout(timeOut);
		socket = new eio.Socket(scrollback.host, {jsonp: "createElement" in document});
		getConnection(socket, "sbtestinguser");
		socket.on("message", function(msg) {
			var back = {
					from: "sbtestinguser",
					type: "back",
					to: "scrollback"
				},
				join = {
					to: "scrollback",
					type: "join"
				};
			msg = JSON.parse(msg);
			console.log(msg);
			if (msg.type === "init") {
				// text.session = msg.session;
				socket.send(JSON.stringify(back));
				return;
			}

			if (msg.type === "back") {
				join.from = msg.from;
				socket.send(JSON.stringify(join));
				return;
			}
			assert(msg.type !== "error", "join action failed");
			socket.close();
			done();
		});
	});

	it("join action from a guest", function(done) {
		this.timeout(timeOut);
		socket = new eio.Socket(scrollback.host, {jsonp: "createElement" in document});
		getConnection(socket, "guest");
		socket.on("message", function(msg) {
			var back = {
					from: "guest",
					type: "back",
					to: "scrollback"
				},
				join = {
					to: "scrollback",
					type: "join"
				};
			msg = JSON.parse(msg);
			console.log(msg);
			if (msg.type === "init") {
				// text.session = msg.session;
				socket.send(JSON.stringify(back));
				return;
			}

			if (msg.type === "back") {
				join.from = msg.from;
				socket.send(JSON.stringify(join));
				return;
			}
			assert(msg.type === "error", "Join action happened from a guest user");
			assert(msg.message === "ERR_NOT_ALLOWED", "wrong error message");
			socket.close();
			done();
		});
	});

	it("Action PART: ", function(done) {
		this.timeout(timeOut);
		socket = new eio.Socket(scrollback.host, {jsonp: "createElement" in document});
		getConnection(socket, "sbtestinguser");
		socket.on("message", function(msg) {
			var back = {
					from: "sbtestinguser",
					type: "back",
					to: "scrollback"
				},
				part = {
					to: "scrollback",
					type: "part"
				};
			msg = JSON.parse(msg);
			console.log(msg);
			if (msg.type === "init") {
				// text.session = msg.session;
				socket.send(JSON.stringify(back));
				return;
			}

			if (msg.type === "back") {
				part.from = msg.from;
				socket.send(JSON.stringify(part));
				return;
			}
			assert(msg.type !== "error", "part action failed");
			socket.close();
			done();
		});
	});
});
