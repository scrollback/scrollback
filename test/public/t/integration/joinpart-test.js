/*global describe*/
/*global it*/
/*global assert*/
/*global SockJS*/
/*global scrollback*/
/*global getConnection*/

describe('Testing join/part action of a user: ', function() {

	var socket;
		it("join action", function(done) {
			socket = new SockJS(scrollback.host + "/socket");
			getConnection(socket, "testinguser");
			socket.onmessage = function(msg) {
				var back = {
						from: "testinguser",
						type: 'back',
						to: "scrollback"
					},
					join = {
						to: "scrollback",
						type: 'join'
					};
				msg = JSON.parse(msg.data);
				console.log(msg);
				if (msg.type === 'init') {
					//text.session = msg.session;
					socket.send(JSON.stringify(back));
					return;
				}

				if (msg.type === 'back') {
					join.from = msg.from;
					socket.send(JSON.stringify(join));
					return;
				}
				assert(msg.type !== 'error', "join action failed");
				socket.close();
				done();
			};
		});

	it("join action from a guest", function(done) {
			socket = new SockJS(scrollback.host + "/socket");
			getConnection(socket, "guest");
			socket.onmessage = function(msg) {
				var back = {
						from: "guest",
						type: 'back',
						to: "scrollback"
					},
					join = {
						to: "scrollback",
						type: 'join'
					};
				msg = JSON.parse(msg.data);
				console.log(msg);
				if (msg.type === 'init') {
					//text.session = msg.session;
					socket.send(JSON.stringify(back));
					return;
				}

				if (msg.type === 'back') {
					join.from = msg.from;
					socket.send(JSON.stringify(join));
					return;
				}
				assert(msg.type === 'error', "Join action happened from a guest user");
				assert(msg.message === 'ERR_NOT_ALLOWED', "wrong error message" );
				socket.close();
				done();
			};
		});

	it("part action", function(done) {
			socket = new SockJS(scrollback.host + "/socket");
			getConnection(socket, "testinguser");
			socket.onmessage = function(msg) {
				var back = {
						from: "testinguser",
						type: 'back',
						to: "scrollback"
					},
					part = {
						to: "scrollback",
						type: 'part'
					};
				msg = JSON.parse(msg.data);
				console.log(msg);
				if (msg.type === 'init') {
					//text.session = msg.session;
					socket.send(JSON.stringify(back));
					return;
				}

				if (msg.type === 'back') {
					part.from = msg.from;
					socket.send(JSON.stringify(part));
					return;
				}
				assert(msg.type !== 'error', "part action failed");
				socket.close();
				done();
			};
		});
});
