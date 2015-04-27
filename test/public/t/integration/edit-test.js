/*global describe*/
/*global it*/
/*global uid*/

/*global SockJS*/
/*global scrollback*/
/*global beforeEach*/
/*global afterEach*/

describe('Testing ACTION edit: ', function() {

	var socket;
	beforeEach(function(done) {
		socket = new SockJS(scrollback.host + "/socket");
		var sessionId = "web://" + uid();
		var init = {
			"auth": {
				testauth: "dummyuser"
			},
			"id": sessionId,
			"type": "init",
			"to": "me",
			"suggestedNick": "testinuser",
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
	
	it('user editing a text', function(done) {
		socket.onmessage = function(msg) {
			msg = JSON.parse(msg.data);
			console.log(msg);
			var m = {
				from: "testinguser",
				type: 'back',
				to: "scrollback"
			};
			
			var text = {
				from: "testinguser",
				text: "i am the boss",
				id: "z5jrpsi5gdtvvmjffhdia3wa4pjio4ak",
				tags: ["hidden"],
				type: "text",
				to: "scrollback",
				time: new Date().getTime()
			};
			
			var edit = {
				ref: "z5jrpsi5gdtvvmjffhdia3wa4pjio4ak",
				tags: ["abusive"],
				type: "edit",
				to: "scrollback",
				time: new Date().getTime()
			};
			
			if (msg.type === 'init') {
				text.session = msg.session;
				socket.send(JSON.stringify(m));
				return;
			}
			
			if(msg.type === 'back'){
				socket.send(JSON.stringify(text));
				return;
			}
			
			if(msg.type === 'text'){
				console.log(text.id);
				socket.send(JSON.stringify(edit));
				return;
			}
			
			done();
		};
	});
	
	afterEach(function(done) {
		socket.close();
		done();
	});
});
