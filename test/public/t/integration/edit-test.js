/*global describe*/
/*global it*/
/*global uid*/
/*global assert*/
/*global SockJS*/
/*global scrollback*/
/*global beforeEach*/
/*global afterEach*/
/*global getConnection*/

describe('Testing ACTION edit: ', function() {
	var socket;
	beforeEach(function(done) {

		socket = new SockJS(scrollback.host + "/socket");
		getConnection(socket);
		done();
	});

	it('Editing text tag', function(done) {
		socket.onmessage = function(msg) {
			var id = uid(),
				back = {
					from: "testinguser",
					type: 'back',
					to: "ckroom"
				},
				text = {
					from: "testinguser",
					text: "i am the bos",
					id: id,
					tags: ["null"],
					type: "text",
					to: "ckroom",
					time: new Date().getTime()
				},
				edit = {
					tags: ["hidden"],
					type: "edit",
					to: "ckroom",
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
			if (msg.type === 'edit') {
				console.log(msg.ref);

			}
			assert(msg.type !== 'error', "edit action failed");
			done();
		};
	});

	it('Editing text content', function(done) {
		socket.onmessage = function(msg) {
			var id = uid(),

				back = {
					from: "testinguser",
					type: 'back',
					to: "ckroom"
				},
				text = {
					from: "testinguser",
					text: "i am the bos",
					id: id,
					tags: ["null"],
					type: "text",
					to: "ckroom",
					time: new Date().getTime()
				},
				edit = {
					tags: ["hidden"],
					type: "edit",
					to: "ckroom",
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
			assert(msg.type !== 'error', "edit action failed");
			done();
		};
	});
	
	it('Editing text with wrong text id', function(done) {
		socket.onmessage = function(msg) {
			var id = uid(),

				back = {
					from: "testinguser",
					type: 'back',
					to: "ckroom"
				},
				text = {
					from: "testinguser",
					text: "i am the bos",
					id: id,
					tags: ["null"],
					type: "text",
					to: "ckroom",
					time: new Date().getTime()
				},
				edit = {
					tags: ["hidden"],
					type: "edit",
					to: "ckroom",
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
				edit.ref = uid();
				edit.text = "I am not boss!!";
				//console.log(edit);
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

	it('Editing action from an unauthorized user', function(done) {
		socket.onmessage = function(msg) {
			var id = uid(),
				back = {
					from: "testinguser",
					type: 'back',
					to: "scrollback"
				},
				text = {
					from: "testinguser",
					text: "testing message for edit",
					id: id,
					tags: ["null"],
					type: "text",
					to: "scrollback",
					time: new Date().getTime()
				},
				edit = {
					tags: ["hidden"],
					type: "edit",
					to: "scrollback",
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
				console.log(edit);
				edit.ref = msg.id;
				socket.send(JSON.stringify(edit));
				return;
			}
			if (msg.type === 'edit') {
				console.log(msg.ref);

			}
			assert(msg.type === 'error', "edit action happened from unauthorized user");
			assert(msg.message === 'ERR_NOT_ALLOWED', "wrong error message");
			done();
		};
	});
	
	afterEach(function(done) {
		socket.close();
		done();
	});
});
