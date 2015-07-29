/* global describe it assert SockJS scrollback beforeEach afterEach getConnection*/ /* eslint no-console: 0, array-bracket-spacing: 0, no-param-reassign: 0 */

"use strict";
var timeOut = 3000;
describe("Action BACK: ", function() {
	var socket;
	beforeEach(function(done) {
		socket = new SockJS(scrollback.host + "/socket");
		getConnection(socket);
		done();
	});

	it("back action with all property ", function(done) {
		this.timeout(timeOut);
		socket.onmessage = function(message) {
			var m = {
				from: "testinguser",
				type: "back",
				to: "scrollback"
			};
			message = JSON.parse(message.data);
			console.log(message.type);

			if (message.type === "init") {
				socket.send(JSON.stringify(m));
				return;
			}
			assert(message.type !== "error", "back action failed");
			done();
		};
	});
	it("back action without 'to' property ", function(done) {
		this.timeout(timeOut);
		socket.onmessage = function(message) {
			var m = {
				from: "testinguser",
				type: "back"
			};
			message = JSON.parse(message.data);
			console.log(message.type);

			if (message.type === "init") {
				socket.send(JSON.stringify(m));
				return;
			}
			assert(message.type === "error", "back action success without 'to' ");
			done();
		};
	});


	it("back action without 'from' property ", function(done) {
		this.timeout(timeOut);
		socket.onmessage = function(message) {
			var m = {
				type: "back",
				to: "scrollback"
			};
			message = JSON.parse(message.data);
			console.log(message.type);

			if (message.type === "init") {
				socket.send(JSON.stringify(m));
				return;
			}
			assert(message.type === "error", "back action success without 'from' ");
			done();
		};
	});

	afterEach(function(done) {
		socket.close();
		done();
	});

});
