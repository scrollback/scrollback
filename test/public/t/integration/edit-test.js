/*global describe*/
/*global it*/
/*global uid*/
/*global assert*/
/*global SockJS*/
/*global scrollback*/
/*global beforeEach*/
/*global afterEach*/
/*global getConnection*/
"use strict";
var timeOut = 3000;
describe('Testing ACTION edit: ', function() {
	describe('Authorized user', function() {
		var socket;
		beforeEach(function(done) {

			socket = new SockJS(scrollback.host + "/socket");
			getConnection(socket, "testinguser");
			done();
		});

		it('Editing text tag', function(done) {
			this.timeout(timeOut);
			socket.onmessage = function(msg) {
				var id = uid(),
					back = {
						from: "testinguser",
						type: 'back',
						to: "test-room"
					},
					text = {
						from: "testinguser",
						text: "i am the bos",
						id: id,
						type: "text",
						to: "test-room",
						time: new Date().getTime()
					},
					edit = {
						tags: ["hidden"],
						type: "edit",
						to: "test-room",
						time: new Date().getTime()
					};
				msg = JSON.parse(msg.data);
				console.log(msg);
				if (msg.type === 'init') {
					//text.session = msg.session;
					socket.send(JSON.stringify(back));
					return;
				}

				if (msg.type === 'back') {
					socket.send(JSON.stringify(text));
					return;
				}

				if (msg.type === 'text') {
					edit.ref = msg.id;
					//console.log(edit);
					socket.send(JSON.stringify(edit));
					return;
				}

				if (msg.message === 'TEXT_NOT_FOUND')
					assert(msg.type !== 'error', "edit action failed " + msg.message);
				else assert(msg.type !== 'error', "edit action failed ");
				done();
			};
		});

		it('Editing text content', function(done) {
			this.timeout(timeOut);
			socket.onmessage = function(msg) {
				var id = uid(),

					back = {
						from: "testinguser",
						type: 'back',
						to: "test-room"
					},
					text = {
						from: "testinguser",
						text: "i am the bos",
						id: id,
						type: "text",
						to: "test-room",
						time: new Date().getTime()
					},
					edit = {
						tags: ["hidden"],
						type: "edit",
						to: "test-room",
						time: new Date().getTime()
					};
				msg = JSON.parse(msg.data);
				console.log(msg);
				if (msg.type === 'init') {
					//text.session = msg.session;
					socket.send(JSON.stringify(back));
					return;
				}

				if (msg.type === 'back') {
					text.id = id;
					socket.send(JSON.stringify(text));
					return;
				}

				if (msg.type === 'text') {
					edit.ref = msg.id;
					edit.text = "I am not boss!!";
					//console.log(edit);
					socket.send(JSON.stringify(edit));
					return;
				}
				if (msg.type === 'edit') {
					console.log(msg.ref);
				}
				if (msg.message === 'TEXT_NOT_FOUND')
					assert(msg.type !== 'error', "edit action failed " + msg.message);
				else assert(msg.type !== 'error', "edit action failed ");
				done();
			};
		});

		it('Editing text with wrong text id', function(done) {
			this.timeout(timeOut);
			socket.onmessage = function(msg) {
				var id = uid(),

					back = {
						from: "testinguser",
						type: 'back',
						to: "test-room"
					},
					text = {
						from: "testinguser",
						text: "i am the bos",
						id: id,
						type: "text",
						to: "test-room",
						time: new Date().getTime()
					},
					edit = {
						tags: ["hidden"],
						type: "edit",
						to: "test-room",
						time: new Date().getTime()
					};
				msg = JSON.parse(msg.data);
				console.log(msg);
				if (msg.type === 'init') {
					socket.send(JSON.stringify(back));
					return;
				}

				if (msg.type === 'back') {
					text.id = id;
					socket.send(JSON.stringify(text));
					return;
				}

				if (msg.type === 'text') {
					edit.ref = uid();
					edit.text = "I am not boss!!";
					socket.send(JSON.stringify(edit));
					return;
				}
				if (msg.type === 'edit') {
					console.log(msg.ref);
				}
				assert(msg.type === 'error', "edited text with another id");
				assert(msg.message === 'TEXT_NOT_FOUND', "wrong error message");
				done();
			};
		});

		afterEach(function(done) {
			socket.close();
			done();
		});
	});

	describe('Guest user', function() {
		var socket;
		it("Edit action from a guest user", function(done) {
			this.timeout(timeOut);
			socket = new SockJS(scrollback.host + "/socket");
			getConnection(socket, "guest");
			socket.onmessage = function(msg) {
				var id = uid(),
					back = {
						from: "testinguser",
						type: 'back',
						to: "test-room"
					},
					text = {
						from: "testinguser",
						text: "I am guest-user",
						id: id,
						type: "text",
						to: "test-room"
					},
					edit = {
						tags: ["hidden"],
						type: "edit",
						to: "test-room"
					};
				msg = JSON.parse(msg.data);
				console.log(msg);
				if (msg.type === 'init') {
					//text.session = msg.session;
					socket.send(JSON.stringify(back));
					return;
				}

				if (msg.type === 'back') {
					socket.send(JSON.stringify(text));
					return;
				}

				if (msg.type === 'text') {
					console.log(edit);
					edit.ref = msg.id;
					socket.send(JSON.stringify(edit));
					return;
				}
				if (msg.type === 'edit') {
					console.log(msg.ref);

				}
				assert(msg.type === 'error', "guest user can edit text");
				assert(msg.message === 'ERR_NOT_ALLOWED', "wrong error message");
				socket.close();
				done();
			};
		});
	});
	
	describe('Unauthorized user', function() {
		this.timeout(timeOut);
		var socket;
		it('Editing action from an unauthorized user', function(done) {
			socket = new SockJS(scrollback.host + "/socket");
			getConnection(socket, "sbtestinguser");
			socket.onmessage = function(msg) {
				var id = uid(),
					back = {
						from: "sbtestinguser",
						type: 'back',
						to: "test-room"
					},
					text = {
						from: "sbtestinguser",
						text: "testing message for edit",
						id: id,
						type: "text",
						to: "test-room",
						time: new Date().getTime()
					},
					edit = {
						tags: ["hidden"],
						type: "edit",
						to: "test-room",
						time: new Date().getTime()
					};
				msg = JSON.parse(msg.data);
				console.log(msg);
				if (msg.type === 'init') {
					socket.send(JSON.stringify(back));
					return;
				}

				if (msg.type === 'back') {
					socket.send(JSON.stringify(text));
					return;
				}

				if (msg.type === 'text') {
					console.log(edit);
					edit.ref = msg.id;
					socket.send(JSON.stringify(edit));
					return;
				}
				if (msg.type === 'edit') {
					console.log(msg.ref);

				}
				assert(msg.type === 'error', "unauthorized user can edit text");
				assert(msg.message === 'ERR_NOT_ALLOWED', "wrong error message");
				socket.close();
				done();
			};
		});
	});

});
