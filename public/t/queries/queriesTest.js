describe("Queries", function() {
	var socket ;
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
			socket.onmessage =  function(action) {
				var it = action.data;
				console.log("returned session ", it);
				done();
			};
			socket.send(JSON.stringify(init));
		};
	});

	it("getTexts test", function (done) {
		var query = {
			id: guid(),
			type: "getTexts",
			session: "web:" + guid(),
			room: "scrollback-test",
			time: new Date().getTime()
		};
		socket.onmessage = function(reply) {
			console.log("get Text Reply" , reply);
			reply.data = JSON.parse(reply.data);
			assert.ok(reply.data.length, "Reply is not an array.");
			assert.equals(typeof reply.data, 'object', "Reply is not an array.");
			reply.data.forEach(function(m) {
				assert.equals(m.type, 'text', "data is not in correct format");
			});
			done();
		};
		socket.send(JSON.stringify(query));
	});

	it("getUsers test", function (done) {
		var query = {
			id: guid(),
			type: "getUsers",
			session: "web:" + guid(),
			room: "scrollback-test",
			time: new Date().getTime()
		};
		socket.onmessage = function(reply) {
			console.log("get Text Reply" , reply);
			reply.data = JSON.parse(reply.data);
			assert.ok(reply.data.length, "Reply is not an array.");
			assert.equals(typeof reply.data, 'object', "Reply is not an array.");
			reply.data.forEach(function(user) {
				assert.equals(user.type, 'user', "data is not in correct format");
			});
			done();
		};
		socket.send(JSON.stringify(query));
	});

	it("getRooms test", function (done) {
		var query = {
			id: guid(),
			type: "getRooms",
			session: "web:" + guid(),
			time: new Date().getTime()
		};
		socket.onmessage = function(reply) {
			console.log("get Text Reply" , reply);
			reply.data = JSON.parse(reply.data);
			assert.ok(reply.data.length, "Reply is not an array.");
			assert.equals(typeof reply.data, 'object', "Reply is not an array.");
			reply.data.forEach(function(user) {
				assert.equals(user.type, 'room', "data is not in correct format");
			});
			done();
		};
		socket.send(JSON.stringify(query));
	});

	it("getThreads test", function (done) {
		var query = {
			type: "getThreads",
			session: "web:" + guid(),
			room: "scrollback-test",
			time: new Date().getTime()
		};
		socket.onmessage = function(reply) {
			console.log("get Text Reply" , reply);
			reply.data = JSON.parse(reply.data);
			assert.ok(reply.data.length, "Reply is not an array.");
			assert.equals(typeof reply.data, 'object', "Reply is not an array.");
			reply.data.forEach(function(m) {
				assert.equals(m.type, 'text', "data is not in correct format");
				assert.ok(m.threads, "data is not in correct format");
			});
			done();
		};
		socket.send(JSON.stringify(query));
	});

	it("getSessions test", function (done) {
		//TODO ?
		var query = {
			type: "getSessions",
			session: "web:" + guid(),
			time: new Date().getTime(),
			ref: "guest-" + "testing2"
		};
		socket.onmessage = function(reply) {
			console.log("get Text Reply" , reply);
			reply.data = JSON.parse(reply.data);
			assert.equal(reply.data.err, "error", "Should not return session data");
			//TODO check for actual error
		};
		socket.send(JSON.stringify(query));
	});

	afterEach (function(done) {
		socket.close();
		done();
	});
});
