/*global describe*/
/*global it*/
/*global uid*/
/*global assert*/
/*global SockJS*/
/*global scrollback*/
/*global beforeEach*/
/*global afterEach*/

describe('Testing join/part action of a user: ', function() {

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

	it('guest user joining a room', function(done) {
		socket.onmessage = function(msg) {
			msg = JSON.parse(msg.data);
			console.log(msg);
			var join = {
				type: "join",
				to: "scrollback",
				from: msg.from,
			};
			
			if (msg.type === 'init') {
				socket.send(JSON.stringify(join));
				return;
			}
			assert(msg.type !== 'error', "back action failed");
			done();
		};

	});

	afterEach(function(done) {
		socket.close();
		done();
	});
});
