describe("Text Message Test", function() {

	var socket ;
	var text = {
		id: guid(),
		type: 'text',
		to: 'scrollback-test',
		from: 'guest-testing',
		time: new Date().getTime()
	};
	var init = {
		id: guid(),
		type: 'init',
		to: 'me',
		session: "web://" + guid()
	}
	beforeEach(function(done) {
		this.timeout(10000);
		socket = new SockJS(scrollback.host + '/socket');
		socket.onopen = function() {
			socket.onmessage =  function(action) {
				var it = action.data;
				console.log("returned session ", it);
				done();
			};
			socket.send(JSON.stringify(init));
		};
	});
	it("text Message with no Text property", function(done) {
		text.session = init.session;
		socket.onmessage = function(action) {
			console.log("message returned:", action.data);
			action.data = JSON.parse(action.data);
			assert.equal(action.data.type , 'error', "Not throwing error for invalid message");
			//TODO check for error.. action.data.message
			done();
		};
		socket.send(JSON.stringify(text));
	});

	it("Text Message with no session", function(done) {
		delete text.session;
		socket.onmessage = function(action) {
			//should gen a session.
			action.data = JSON.parse(action.data);
			assert.ok(action.data.session , "Session is not defined.");
			console.log("message returned:", action.data);
			done();
		};
		socket.send(JSON.stringify(text));
	});

	it("valid Text Message", function(done) {

		text.session = "web:" + guid();
		text.mentions = ['testUser1', 'testUser2'];
		text.text = "this is a testing message";
		socket.onmessage = function(action) {
			action.data = JSON.parse(action.data);
			assert.equals(text.id, action.data.id, "Not Returning with same message");
			assert.ok(!action.data.err, "Throwing error " + action.data.message );
			console.log("message returned:", action.data);
			done();
		};
		socket.send(JSON.stringify(text));
	});


	it("Login Required Test", function(done) {
		//TODO add guest and room
		//room "loginrequiredtrue" should present for this test to pass
		text.to = "loginrequiredtrue";
		socket.onmessage = function(action) {
			action.data = JSON.parse(action.data);
			assert.equals(action.data.err, "error", "not blocking message for room where login required is true.");
			assert.equals(action.data.message, "AUTH_REQ_TO_POST", "not blocking message for room where login required is true.");
			console.log("message returned:", action.data);
			done();
		};
		socket.send(JSON.stringify(text));
	});

	


	it("Repetitive text test(max allowed=3)", function(done) {
		text.to = "scrollback-test";
		var uid = guid();
		var ct = 0;
		socket.onmessage = function(action) {
			action.data = JSON.parse(action.data);
			if(action.data.id === uid) {
				assert.equals(action.data.err, "error", "Not throwing error for repetitive message");
				assert.equals(action.data.message, "REPETITIVE", "Not throwing error for repetitive message");
			}
			console.log("message returned:", action.data);
			done();
		};
		socket.send(JSON.stringify(text));
		text.id = guid();
		text.time = new Date().getTime();
		socket.send(JSON.stringify(text));
		text.id = guid();
		text.time = new Date().getTime();
		socket.send(JSON.stringify(text));
		text.id = uid;
		text.time = new Date().getTime();
		socket.send(JSON.stringify(text));
	});



	afterEach(function(done) {
		socket.close();
		done();
	});
});