(function(){
	var socket;
	describe("socket test", function() {
		describe("socket connection", function() {
			it("socket connection established.", function(done) {
				socket = new SockJS(scrollback.host + '/socket');
				socket.onopen = function() {
					done();
				};
			});
			it("socket closing.", function(done) {
				socket.close();
				done();
			});	
		});

		describe("sending message over socket", function() {
			beforeEach(function(done){
				socket = new SockJS(scrollback.host + '/socket');
				socket.onopen = function() {
					done();
				};
			});
			afterEach(function(done){
				socket.close();
				done();
			});
			it("echo back the action", function(done) {
				var action = {type:"back", time:new Date().getTime(), text:"hi there..", to:"scrollback", "from":"harish"};
				socket.onmessage = function(message){
					message = JSON.parse(message.data);
					assert.equal(message.type, "back", "response tampered");
					done();
				};
				socket.send(JSON.stringify(action));
			});
		});
	});
})();