/* global describe it uid assert SockJS scrollback beforeEach afterEach getConnection word */ /* eslint no-console: 0, array-bracket-spacing: 0, no-param-reassign: 0 */

"use strict";
describe("Action ROOM: ", function() {
	var socket;
	var roomId = word(7),
		rid = uid();

	it("Creating room", function(done) {
		socket = new SockJS(scrollback.host + "/socket");
		getConnection(socket, "testinguser");
		//		this.timeout(timeOut);
		socket.onmessage = function(msg) {
			var roomEvent = {
				room: {
					id: roomId,
					params: {},
					guides: {},
					description: "this is a new room"
				},
				type: "room",
				id: rid,
				to: roomId
			};
			msg = JSON.parse(msg.data);
			console.log(msg);
			if (msg.type === "init") {
				socket.send(JSON.stringify(roomEvent));
				return;
			}
			assert(msg.type !== "error", "Room creation failed ");
			socket.close();
			done();
		};
	});

	it("Editing room by a registered user", function(done) {
		socket = new SockJS(scrollback.host + "/socket");
		getConnection(socket, "sbtestinguser");
		//		this.timeout(timeOut);
		socket.onmessage = function(msg) {
			var back = {
					from: "sbtestinguser",
					to: roomId,
					type: "back"
				},
				room = {
					room: {
						id: roomId,
						params: {},
						guides: {}
					},
					type: "room",
					to: roomId,
					from: "testinguser"
				};
			msg = JSON.parse(msg.data);
			console.log(msg);
			if (msg.type === "init") {
				socket.send(JSON.stringify(back));
				return;
			}
			if (msg.type === "back") {
				room.session = msg.session;
				socket.send(JSON.stringify(room));
				return;
			}
			assert(msg.type === "error", "unauthorized user can edit a room ");
			assert(msg.message.message === "ERR_NOT_ALLOWED", "wrong error message: " + msg.message);
			socket.close();
			done();
		};
	});

	it("Editing room by a guest user", function(done) {
		socket = new SockJS(scrollback.host + "/socket");
		getConnection(socket);
		//		this.timeout(timeOut);
		socket.onmessage = function(msg) {
			var back = {
					from: "guest",
					to: roomId,
					type: "back"
				},
				room = {
					room: {
						id: roomId,
						params: {},
						guides: {}
					},
					type: "room",
					to: roomId,
					from: "testinguser"
				};
			msg = JSON.parse(msg.data);
			console.log(msg);
			if (msg.type === "init") {
				socket.send(JSON.stringify(back));
				return;
			}
			if (msg.type === "back") {
				room.session = msg.session;
				socket.send(JSON.stringify(room));
				return;
			}
			assert(msg.type === "error", "guest user can edit a room ");
			assert(msg.message === "ERR_NOT_ALLOWED", "wrong error message: " + msg.message);
			socket.close();
			done();
		};
	});

	describe("Editing room config", function() {
		beforeEach(function(done) {
			socket = new SockJS(scrollback.host + "/socket");
			getConnection(socket, "testinguser");
			done();
		});

		afterEach(function(done) {
			socket.close();
			done();
		});
		it("Editing room permission", function(done) {
			socket.onmessage = function(msg) {
				var back = {
						from: "testinguser",
						to: roomId,
						type: "back"
					},
					room = {
						room: {
							id: roomId,
							params: {},
							guides: {
								authorizer: {
									readLevel: "follower",
									writeLevel: "follower"
								}
							}
						},
						type: "room",
						to: roomId,
						from: "testinguser"
					};
				msg = JSON.parse(msg.data);
				console.log(msg);
				if (msg.type === "init") {
					socket.send(JSON.stringify(back));
					return;
				}
				if (msg.type === "back") {
					room.session = msg.session;
					socket.send(JSON.stringify(room));
					return;
				}
				assert(msg.type !== "error", "Room saving failed ");
				assert(msg.room.guides.authorizer.readLevel === "follower", "room editing failed for read permission!!");
				assert(msg.room.guides.authorizer.writeLevel === "follower", "room editing failed for write permission!!");
				done();
			};
		});

		it("Editing room description", function(done) {
			socket.onmessage = function(msg) {
				var back = {
						from: "testinguser",
						to: roomId,
						type: "back"
					},
					room = {
						room: {
							id: roomId,
							params: {},
							guides: {},
							description: "The room description is edited by test script"
						},
						type: "room",
						to: roomId,
						from: "testinguser"
					};
				msg = JSON.parse(msg.data);
				console.log(msg);
				if (msg.type === "init") {
					socket.send(JSON.stringify(back));
					return;
				}
				if (msg.type === "back") {
					room.session = msg.session;
					socket.send(JSON.stringify(room));
					return;
				}
				assert(msg.type !== "error", "Room saving failed ");
				assert(msg.room.description === "The room description is edited by test script", "room editing failed for description!!");
				done();
			};
		});

		it("Editing spam control", function(done) {
			socket.onmessage = function(msg) {
				var back = {
						from: "testinguser",
						to: roomId,
						type: "back"
					},
					room = {
						room: {
							id: roomId,
							params: {
								antiAbuse: {
									spam: true,
									block: {
										english: true
									},
									customPhrases: ["fawk"]
								}
							},
							guides: {}
						},
						type: "room",
						to: roomId,
						from: "testinguser"
					};
				msg = JSON.parse(msg.data);
				console.log(msg);
				if (msg.type === "init") {
					socket.send(JSON.stringify(back));
					return;
				}
				if (msg.type === "back") {
					room.session = msg.session;
					socket.send(JSON.stringify(room));
					return;
				}
				assert(msg.type !== "error", "Room saving failed ");
				assert(msg.room.params.antiAbuse.spam === true, "spam control saving failed!!");
				assert(msg.room.params.antiAbuse.block.english === true, "spam control saving failed!!");
				assert(msg.room.params.antiAbuse.customPhrases[0] === "fawk", "spam control saving failed!!");
				done();
			};
		});

	});
});
