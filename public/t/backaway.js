var users = [];
describe('Testing "BACK and away" Action.', function() {
	// describe('Testing "BACK" Action.', function() {});
	describe('Basic test', function() {
		describe.only('Validation text', function() {
			var sessionID = generate.uid();
			users.push(sessionID);
			it.only('No To property in back', function(done) {
				getConnection(sessionID, function(c) {
					var guid, connection = c;
					guid = generate.uid();
					users.push(connection.session);
					console.log("Got connection......", connection.emit);
					connection.emit({
						id: guid,
						type: "back"
					}, function(data) {
						console.log("callback of back event");
						if(data.id == guid && !data.error){
							throw new Error("Error Not Thrown");
						}else{
							assert.equal(data.error, "ERR_NO_TO_PROPERTY", "Error message is incorrect");
							done();
						}
					});
				});	
			});
			it('No To property in away', function(done) {
				getConnection(sessionID, function(c) {
					var guid, connection = c;
					guid = generate.uid();
					users.push(connection.session);
					connection.emit({
						id: guid,
						type: "back"
					}, function(data) {
						if(data.id == guid && !data.error){
							throw new Error("Error Not Thrown");
						}else{
							assert.equal(data.error, "ERR_NO_TO_PROPERTY", "Error message is incorrect");
							done();
						}
					});
				});	
			});

			it('No ID and time property in back', function(done) {
				getConnection(users[0], function(c) {
					var guid, connection = c;
					guid = generate.uid();
					connection.emit({
						id: guid,
						type: "back",
						to: "scrollback"
					}, function(data){
						if(data.id == guid && !data.error) {
							done();
						}else{
							throw new Error("Error Thrown");
						}
					});
				})
			});
			it('No ID and time property in away', function(done) {
				getConnection(users[0], function(c) {
					var guid, connection = c;
					guid = generate.uid();
					connection.emit({
						id: guid,
						type: "away",
						to: "scrollback"
					}, function(data){
						if(data.id == guid && !data.error) {
							done();
						}else{
							throw new Error("Error Thrown");
						}
					});
				})
			});
		});


		describe('Texting echo of back messages.', function() {
			var connection;
			/*afterEach(function(done) {
				connection.emit({
					id: generate.uid(),
					type: "away",
					to:"scrollback"
				}, function(){
					done();	
				});
			});	*/
			it('Sending back for user1 on scrollback and expecting back', function(done) {
				getConnection(users[0], function(c) {
					var guid, connection = c;
					guid = generate.uid();
					connection1.onAction = function(data) {
						
					};
					connection.emit({
						id: guid,
						type: "back",
						to: "scrollback"
					}, function(data){
						if(data.id == guid && data.error){
							throw new Error("Error Thrown");
						}
					});
				});
			});

			it('Sending a second back message for user1 on scrollback. Should not hear an echo.', function(done) {
				getConnection(users[0], function(c) {
					var secondBack = generate.uid();
					connection = c;
					connection.onAction = function(data) {
						if(data.id == secondBack) throw new Error("Got back second back");
					}
					connection.emit({
						id: secondBack,
						type: "back",
						to: "scrollback"
					}, function(action){
						throw new Error("GOT back on second time.");
					});
					setTimeout(function(){
						done();
					}, 3000);
				});
			});
			it('Sending back for user 2 on scrollback and expecting echo on user1', function(done) {
				var back = generate.uid(), user1 = false, connection1;
				getConnection(users[0], function(c) {
					connection1 = c;
					user1 = true;
					if(user1 && user2){
						startTest();
					}
				});
				getConnection(users[1], function(c) {
					connection2 = c;
					user2 = true;
					if(user1 && user2){
						startTest();
					}
				});

				function startTest(){
					connection1.onAction = function(data){
						if(data.id == back && data.to == "scrollback"){
							done();
						}
					};
					connection2.emit({
						id: back,
						type: "back",
						to: "scrollback"
					}, function(data){
						if(data.id == back && data.error){
							throw new Error("Error Thrown");
						}
					});
				}
			});
			it('Sending back for user2 on scrollbackteam and user1 shouldnt get the echo.', function(done) {
				var back = generate.uid(), user1 = false, connection1;

				getConnection(users[0], function(c) {
					connection1 = c;
					user1 = true;
					if(user1 && user2){
						startTest();
					}
				});
				getConnection(users[1], function(c) {
					connection2 = c;
					user2 = true;
					if(user1 && user2){
						startTest();
					}
				});

				function startTest(){
					connection1.onAction = function(data){
						if(data.id == back && data.to == "scrollbackteam"){
							throw new Error("Got back for user online on different room.");
						}
					};
					connection2.emit({
						id: back,
						type: "back",
						to: "scrollbackteam"
					}, function(data){
						if(data.id == back && data.error){
							throw new Error("Error Thrown");
						}
					});

					setTimeout(function(){
						done();
					}, 3000);
				}
			});
			
		});

		describe('Authourizor test', function(){

		});
	});
});



/* Doi, thats a weird function name. */
function getConnection(session, callback) {
	var socket = new SockJS(scrollback.host + '/socket'), initDone = false;
	socket.resource = generate.uid();
	var callbacks = {};
	var guid = generate.uid();
	socket.emit = function(action, c) {
		callbacks[action.id] = c;
		socket.send(JSON.stringify(action));
	};
	socket.onopen = function() {
		constructObject(socket);
	};
	function constructObject(socket) {
		socket.onmessage = function(data) {
			data = cleanData(data.data);
			if(data.type === "init" && !initDone && data.id == guid){
				initDone = true;
				socket.session = data.session;
				callback(socket);
			}else{
				callbacks[data.id] && callbacks[data.id](data);
			}
			if(socket.onAction) socket.onAction(data);
		};
		socket.send(JSON.stringify({
			id: guid,
			type:"init",
			time:new Date().getTime(),
			session: session || generate.uid(),
			resource: socket.resource
		}));	
	}
}



function cleanData(data){
	try{
		if(typeof data == "string"){
			data = JSON.parse(data);
		}
	}catch(e){
		data = null;
	}
	return data;
}