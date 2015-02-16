describe("claiming or saving a room", function() {
	var socket ;
	var session;
	beforeEach (function(done) {
		this.timeout(10000);
		socket = new SockJS(scrollback.host + '/socket');
		socket.onopen = function() {
			var init = {
				id: guid(),
				type: 'init',
				to: 'me',
				session: "web://" + guid(),
				auth: {persona : {assertion : "TestingSession"}}
			};
			session = init.session;
			socket.onmessage =  function(action) {
				var it = action.data;
				console.log("returned session ", it);
				done();
			};
			socket.send(JSON.stringify(init));
		};
	});

	it("save with invalid parameters(with random new Session)", function(done) {
		var room = {
			id: "scrollback-test",
			description:    "this is testing room for scrollback",
			type:    "room",
			sessions: ["web://" + guid()] ,
			timezone: -330,
			params: {
				wordban: true
			}
		};
		socket.onmessage = function(action) {
			action.data = JSON.parse(action.data);
			console.log("returned value:", action , "data", action.data);
			assert.equal(action.data.type, "error", "Not throwing error for invalid room obj");
			assert.equal(action.data.message, "INVALID_USER", "Not throwing error for invalid room obj");
			done();
		};
		socket.send(JSON.stringify(room));

	});

	it("save with invalid parameters(No Id)", function(done) {
		var room = {
			description:    "this is testing room for scrollback",
			type:    "room",
			sessions: ["web://" + guid()] ,
			timezone: -330,
			params: {
				wordban: true
			}
		};
		socket.onmessage = function(action) {
			action.data = JSON.parse(action.data);
			console.log("returned value:", action , "data", action.data);
			assert.equal(action.data.type, "error", "Not throwing error for invalid room obj");
			assert.equal(action.data.message, "ID_NOT_SPECIFIED", "Not throwing error for invalid room obj");
			done();
		};
		socket.send(JSON.stringify(room));

	});



	it("Save room as guest", function(done) {
		var initAction = {
			session: "web://" + guid(),
			id: guid(),
			type: 'init',
			to: "me"
		};
		var room = {
			description:    "this is testing room for scrollback",
			type:    "room",
			sessions: ["web://" + guid()] ,
			timezone: -330,
			params: {
				wordban: true
			}
		};
		socket.onmessage = function(action) {

			action.data = JSON.parse(action.data);
			console.log("returned value:", action , "data", action.data);
			if(action.data.type === 'init') {
				room.sessions.push(action.data.session);
				socket.send(JSON.stringify(room));
			}
			else {
				assert.equal(action.data.type, "error", "Not throwing error for invalid room obj");
				assert.equal(action.data.message, "INVALID_USER", "Not throwing error for invalid room obj");
				done();
			}

		};
		socket.send(JSON.stringify(initAction));
	});

	it("save room that user do not own", function(done) {
		this.timeout(100000);
		var newInit = {
			id: guid(),
			type: 'init',
			to: 'me',
			session: "web://" + guid(),
			auth: {persona : {assertion : "TestingSession"}}
		}
		socket.onmessage(function(action) {

			action.data = JSON.parse(action.data);
			if(action.data.type === 'init') {
				var room = {
					id : "roomAlreadyOwned",
					description:  "this is testing room for scrollback",
					type:    "room",
					sessions: [newInit.session] ,
					timezone: -330,
					params: {
						wordban: true
					}
				};
				socket.send(JSON.stringify(room));
			}else {//room
				assert.ok(action.data.err, "saving already saved room");
			}


		});
		socket.send(JOSN.stringify(newInit));

	});

	it("save the new room that no one own", function(done) {
		this.timeout(100000);
		var newInit = {
			id: guid(),
			type: 'init',
			to: 'me',
			session: "web://" + guid(),
			auth: {persona : {assertion : "TestingSession"}}
		}
		socket.onmessage(function(action) {

			action.data = JSON.parse(action.data);
			if(action.data.type === 'init') {
				var room = {
					id : "newTestingRoom",
					description:  "this is testing room for scrollback",
					type:    "room",
					sessions: [newInit.session] ,
					timezone: -330,
					params: {
						wordban: true
					}
				};
				socket.send(JSON.stringify(room));
			}else {//room
				assert.ok(!action.data.err, "Not saving room");
			}


		});
		socket.send(JOSN.stringify(newInit));

	});

	it("save the old room that you own", function(done) {
		this.timeout(100000);
		var newInit = {
			id: guid(),
			type: 'init',
			to: 'me',
			session: "web://" + guid(),
			auth: {persona : {assertion : "TestingSession"}}
		}
		socket.onmessage(function(action) {

			action.data = JSON.parse(action.data);
			if(action.data.type === 'init') {
				var room = {
					id : "myOldRoom",
					description:  "this is testing room for scrollback",
					type:    "room",
					sessions: [newInit.session] ,
					timezone: -330,
					params: {
						wordban: true
					}
				};
				socket.send(JSON.stringify(room));
			}else {//room
				assert.ok(!action.data.err, "Not saving room");
			}
		});
		socket.send(JOSN.stringify(newInit));

	});

	afterEach (function(done) {
		socket.close();
		done();
	});
});




