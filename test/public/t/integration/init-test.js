/*global describe*/
/*global before*/
/*global after*/
/*global it*/
/*global scrollback*/
/*global uid*/
/*global SockJS*/
/*global assert*/

// Test: Action type -- Init
describe("Init test for guests", function(){
	var socket;
	before(function(done){
		socket = new SockJS(scrollback.host+"/socket");
		socket.onopen=function(){done();};
	});
	after(function(done){
		socket.close();
		done();
	});
	// Test: Init for Guests
	describe("Testing Init for Guests", function(){
		it("Sending Init", function(done){
			var init = {
			"id": uid(),
			"type": "init",
			"to": "me",
			"session": "web://"+uid(),
			"resource":uid(),
			"origin": {
						domain: "scrollback.io", 
						verified: true }
			};
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				console.log(message);
				assert(message.type!='error', "Init failed!");
				done();
			};
			socket.send(JSON.stringify(init));
		});
		it("", function(){});
		it("", function(){});
		it("", function(){});
		it("", function(){});
	});
	// All combinations of init with or without some properties
	// Test: Init for Users
	describe("", function(){
		it("", function(){});
		it("", function(){});
		it("", function(){});
		it("", function(){});
		it("", function(){});
	});
});