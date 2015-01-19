describe("User Registration", function(){
	var socket;
	before(function(done){
		socket = new SockJS(scrollback.host + '/socket');
		socket.onopen = function(){ done(); };
	});
	after(function(done){
		socket.close();
		done();
	});
	
	it("Save with Invalid params", function(done){
		var session = guid();
		var init = {id: guid(), type: 'init', session: session, to:'me', time: new Date.getTime(), auth: {
			persona: { 
				assertion: 'fakeAssertionForLoginTest'
			}}
		};
		
		var user = { id: guid(), type: 'user', to: 'me', time: new Date().getTime(), session: session};
		
		socket.onmessage = function(message){
			message = JSON.parse(message.data);
			if(message.type == "init"){};
			if(message.type == "user"){};
		};
		
		socket.send(init);
		socket.send(user);
		//done();
	});
	
	it("Save with valid properties and duplicate id", function(done){
		var session = guid();
		var init = {id: guid(), type: 'init', session: session, to:'me', time: new Date().getTime(), auth: {
			persona: {
				assertion: 'fakeAssertionForLoginTest'
			}
		}};
		var user = { id: 'testid', type: 'user', to: 'me', time: new Date().getTime(), session: session};
		
		socket.onmessage = function(message){
			message = JSON.parse(message.data);
			if(message.type == "init"){};
			if(message.type == "user"){
				// assert
				done();
			};
		};
		
		socket.send(init);
		socket.send(user);
		//done();
	});
	
	it("Save with valid properties and new id", function(done){
		var session = guid();
		var init = { id: guid(), type: 'init', session: session, to: 'me', time: new Date().getTime(), auth: {
			persona: {
				assertion: 'fakeAssertionForLoginTest'
			}
		}};
		var user = { id: guid(), type: 'user', to:'me', time: new Date().getTime(), session: session};
		socket.onmessage = function(message){
			message = JSON.parse(message.data);
			if(message.type == "init"){};
			if(message.type == "user"){
				done();
			}
		}
	});
});