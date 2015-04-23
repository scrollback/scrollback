/*global describe*/
/*global it*/
/*global uid*/
/*global assert*/
/*global SockJS*/
/*global scrollback*/
/*global beforeEach*/
/*global afterEach*/

describe('Action: BACK ', function() {
	var socket;
	beforeEach(function(done) {
		socket = new SockJS(scrollback.host + "/socket");
		var sessionId = "web://" + uid();
		var init = {
			"id": sessionId,
			"type": "init",
			"to": "me",
			"suggestedNick": "testinguser",
			"session": "web://" + uid(),
			"resource": uid(),
			"origin": {
				domain: "scrollback.io",
				verified: true
			}
		};
		socket.onopen = function() {
			socket.send(JSON.stringify(init));
			done();
		};
	});

	it("back action with all property ", function(done) {
		socket.onmessage = function(message) {
			var m = {
				from: "testinguser",
				type: 'back',
				to: "scrollback"
			};
			message = JSON.parse(message.data);
			console.log(message.type);

			if (message.type === 'init') {
				socket.send(JSON.stringify(m));
				return;
			}
			assert(message.type !== 'error', "back action failed");
			done();
		};
	});
	it("back action without 'to' property ", function(done) {
		socket.onmessage = function(message) {
			var m = {
				from: "testinguser",
				type: 'back',
			};
			message = JSON.parse(message.data);
			console.log(message.type);

			if (message.type === 'init') {
				socket.send(JSON.stringify(m));
				return;
			}
			assert(message.type === 'error', "back action success without 'to' ");
			done();
		};
	});


	it("back action without 'from' property ", function(done) {
		socket.onmessage = function(message) {
			var m = {
				type: 'back',
				to: "scrollback"
			};
			message = JSON.parse(message.data);
			console.log(message.type);

			if (message.type === 'init') {
				socket.send(JSON.stringify(m));
				return;
			}
			assert(message.type === 'error', "back action success without 'from' ");
			done();
		};
	});

	afterEach(function(done) {
		socket.close();
		done();
	});

});
