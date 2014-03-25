describe("claiming or saving a room", function() {
	var socket ;
	beforeEach (function(done) {
		this.timeout(10000);
		socket = new SockJS(scrollback.host + '/socket');
		socket.onopen = function() {
			done();
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
		navigator.id.watch({
			onlogin: function(assertion){
				console.log("Assertion is ", assertion);
				//init.auth send it as init
				var a = {
					type: 'init',
					id: guid(),
					auth: {persona: {assertion : assertion}},
					to: "me"
				};
				socket.onmessage(function(r) {
					r.data = JSON.parse(r.data);
					
				});
				session.send(a);
				done();
			},
			onlogout: function(){

			}
		});
		navigator.id.request();

	});

	it("save the new room that no one own", function(done) {
		//TODO ?
	});

	it("save the old room that you own", function(done) {
		//TODO ?
	});

	afterEach (function(done) {
		socket.close();
		done();
	});
});