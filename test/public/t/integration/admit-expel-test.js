/* global describe it uid assert SockJS scrollback beforeEach afterEach getConnection */ /* eslint no-console: 0, array-bracket-spacing: 0, no-param-reassign: 0 */

"use strict";
describe("Action admit/expel: ", function() {
	var socket;
	beforeEach(function(done) {
		socket = new SockJS(scrollback.host + "/socket");
		done();
	});

	afterEach(function(done) {
		socket.close();
		done();
	});
	it("expel an user", function(done) {
		getConnection(socket, "testinguser");
		var expel = {
				to: "private-room3",
				ref: "sbtestinguser",
				role: "banned",
				type: "expel",
				from: "testinguser"
			},

			back = {
				from: "testinguser",
				type: "back",
				to: "private-room3"
			};
		socket.onmessage = function(message) {
			message = JSON.parse(message.data);
			console.log(message);

			if (message.type === "init") {
				socket.send(JSON.stringify(back));
				return;
			}

			if (message.type === "back") {
				socket.send(JSON.stringify(expel));
				return;
			}

			assert(message.type !== "error", "expel action failed ");
			done();
		};
	});

	it("text action from an expeled user", function(done) {
		getConnection(socket, "sbtestinguser");
		var back = {
				from: "sbtestinguser",
				type: "back",
				to: "private-room3"
			},
			text = {
				from: "sbtestinguser",
				text: "hiding message",
				id: uid(),
				type: "text",
				to: "private-room3",
				time: new Date().getTime()
			};
		socket.onmessage = function(message) {
			message = JSON.parse(message.data);
			console.log(message);

			if (message.type === "init") {
				socket.send(JSON.stringify(back));
				return;
			}

			if (message.type === "back") {
				socket.send(JSON.stringify(text));
				return;
			}
			assert(message.message === "ERR_NOT_ALLOWED", "wrong error message: " + message.message);
			assert(message.type === "error", "An expeled user can send message!! ");
			done();
		};
	});
//	it("admit an user", function(done) {
//
//		getConnection(socket, "testinguser");
//		var back = {
//				from: "testinguser",
//				type: "back",
//				to: "private-room3"
//			},
//
//			admit = {
//				to: "private-room3",
//				ref: "sbtestinguser",
//				role: "none",
//				type: "admit",
//				from: "testinguser"
//			};
//
//
//		socket.onmessage = function(message) {
//			message = JSON.parse(message.data);
//			console.log(message);
//
//			if (message.type === "init") {
//				socket.send(JSON.stringify(back));
//				return;
//			}
//
//			if (message.type === "back") {
//				socket.send(JSON.stringify(admit));
//				return;
//			}
//			assert(message.type !== "error", "admit action failed");
//			done();
//		};
//	});it("admit an user", function(done) {
			//
			//		getConnection(socket, "testinguser");
			//		var back = {
			//				from: "testinguser",
			//				type: "back",
			//				to: "private-room3"
			//			},
			//
			//			admit = {
			//				to: "private-room3",
			//				ref: "sbtestinguser",
			//				role: "none",
			//				type: "admit",
			//				from: "testinguser"
			//			};
			//
			//
			//		socket.onmessage = function(message) {
			//			message = JSON.parse(message.data);
			//			console.log(message);
			//
			//			if (message.type === "init") {
			//				socket.send(JSON.stringify(back));
			//				return;
			//			}
			//
			//			if (message.type === "back") {
			//				socket.send(JSON.stringify(admit));
			//				return;
			//			}
			//			assert(message.type !== "error", "admit action failed");
			//			done();
			//		};
			//	});

//	it("text action from an unbanned user", function(done) {
			//		getConnection(socket, "sbtestinguser");
			//		var back = {
			//				from: "sbtestinguser",
			//				type: "back",
			//				to: "private-room3"
			//			},
			//			text = {
			//				from: "sbtestinguser",
			//				text: "helo!! m just unbanned",
			//				id: uid(),
			//				type: "text",
			//				to: "private-room3",
			//				time: new Date().getTime()
			//			};
			//		socket.onmessage = function(message) {
			//			message = JSON.parse(message.data);
			//			console.log(message);
			//
			//			if (message.type === "init") {
			//				socket.send(JSON.stringify(back));
			//				return;
			//			}
			//
			//			if (message.type === "back") {
			//				socket.send(JSON.stringify(text));
			//				return;
			//			}
			//			assert(message.type === "error", "An expeled user can send message!! ");
			//			done();
			//		};
			//	});

});
