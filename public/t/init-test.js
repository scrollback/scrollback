/*global describe*/
/*global before*/
/*global after*/
/*global it*/
/*global scrollback*/
/*global guid*/
/*global sockjs*/
describe("Init for guests" , function(){
	var socket;	
	before(function(done){
		socket = new SockJS(scrollback.host + '/socket');
		socket.onopen = function(){ done(); };
	});
	after(function(done){
		socket.close();
		done();
	});
	describe("Testing init for guest users", function(){
		var sessId = guid(); var sessId2 = guid(); var suggestedNick = 'helloNick', testNick;
		it("Sending init without session property", function(done){
			var init = {id: generate.uid(), type: 'init', to: 'me', time:new Date().getTime()};
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				console.log("Message is", message);
				// assert here
				done();
			}
			socket.send(JSON.stringify(init));
		});
		it("Sending init with session property", function(done){
			var init = {id: generate.uid(), type: 'init', session:sessID , to: 'me', time: new Date().getTime()};
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				// assert
				testNick = message.id;
				done();
			};
			socket.send(JSON.stringify(init));
		});
		it("Sending invalid characters in suggested nick", function(done){
			var init = {id: generate.uid(), type: 'init', session:generate.uid(), suggestedNick:'9some_invalid_nick', to: 'me', time: new Date().getTime()};
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				// assert
				done();
			};
			socket.send(JSON.stringify(init));
		});
		it("Sending init with same session id", function(done){
			var init = {id: generate.uid(), type: 'init', session:sessID , to: 'me', time: new Date().getTime()};
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				// assert
				// check if message.id == testNick
				done();
			};
			socket.send(JSON.stringify(init));
		});
		it("Sending init with session id and suggested nick", function(done){
			var init = {id: generate.uid(), type: 'init', session: sessId2, suggestedNick: suggestedNick, to: 'me', time: new Date().getTime()};
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				done();
			};
			socket.send(JSON.stringify(init));
		});
		it("Sending init with different session id and same suggestedNick", function(done){
			var init = {id: generate.uid(), type: 'init', session: generate.uid(), suggestedNick:suggestedNick, to:'me', time: new Date().getTime()};
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				// suggestedNick should be violated
				done();
			};
			socket.send(JSON.stringify(init));
		});
		it("Sending init with same session id and different suggestedNick", function(done){
			var init = {id: generate.uid(), type: 'init', session: sessId2, suggestedNick: 'newNick', to:'me', time: new Date().getTime()};
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				// suggestedNick should change
				done();
			}
		});
	});
	describe("Testing Init for Logged in users", function(){
		var assertion;
		it("Init with invalid auth for Persona Login", function(done){
			this.timeout(150000);
			navigator.id.watch({
				onlogin: function(assertion){
					console.log("Assertion is ", assertion);
					var init = {id: generate.uid(), type: 'init', session: generate.uid(), to:'me', time: new Date().getTime(), auth: {
						persona : {assertion: 'aFalseAssertionForInvalidAuth'}
					}};
				},
				onlogout: function(){
					
				}
			});
			navigator.id.request();
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				//
				navigator.id.logout();
				done();
			}
		});
		it("Init with invalid auth for Facebook Login", function(done){
			done();
		});
		it("Init with valid auth for Persona Login for an existing user", function(done){
			this.timeout(150000);
			navigator.id.watch({
				onlogin: function(assertion){
					var init = { id: generate.uid(), type: 'init', session: generate.uid(), to: 'me', time: new Date().getTime(), auth: { 
						persona: {assertion: assertion}
					}};
				},
				onlogout: function(){
					
				}
			});
			navigator.id.request();
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				//
				navigator.id.logout();
				done();
			}
		});
		it("Init with valid auth for Facebook Login for an existing user", function(done){
			done();
		});
	});
});
