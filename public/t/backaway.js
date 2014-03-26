var users = [];
describe('Testing "BACK and away" Action.', function() {
	// describe('Testing "BACK" Action.', function() {});
	describe('Basic test', function() {
		describe('Validation text', function() {
			var sessionID = generate.guid();
			users.push(sessionID);


			it('No To property in back', function(done) {
				connectInitAndGiveMeConnectionObject(sessionID, function(c) {
					var guid;
					users.push(connection.session);
					connection = c;

					var guid = generate.guid;
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
			it('No To property in away', function(done) {
				connectInitAndGiveMeConnectionObject(sessionID, function(c) {
					var guid;
					users.push(connection.session);
					connection = c;

					var guid = generate.guid;
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
				connectInitAndGiveMeConnectionObject(users[0], function(c) {
					connection = c;
					var guid = generate.guid;
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
				connectInitAndGiveMeConnectionObject(users[0], function(c) {
					connection = c;
					var guid = generate.guid;
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
					id: generate.guid,
					type: "away",
					to:"scrollback"
				}, function(){
					done();	
				});
			});	*/
			it('Sending back for user1 on scrollback and expecting back', function(done) {
				connectInitAndGiveMeConnectionObject(users[0], function(c) {
					connection = c;
					var guid = generate.guid;
					connection1.onAction = function(data) {
						
					});
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
				connectInitAndGiveMeConnectionObject(users[0], function(c) {
					connection = c;
					var secondBack = generate.guid;


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
				var back = generate.guid(), user1 = false, connection1;
				connectInitAndGiveMeConnectionObject(users[0], function(c) {
					connection1 = c;
					user1 = true;
					if(user1 && user2){
						startTest();
					}
				});
				connectInitAndGiveMeConnectionObject(users[1], function(c) {
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
				var back = generate.guid(), user1 = false, connection1;

				connectInitAndGiveMeConnectionObject(users[0], function(c) {
					connection1 = c;
					user1 = true;
					if(user1 && user2){
						startTest();
					}
				});
				connectInitAndGiveMeConnectionObject(users[1], function(c) {
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
function connectInitAndGiveMeConnectionObject(session, callback) {
	var socket = new SockJS(scrollback.host + '/socket'), initDone = false;
	var callbacks = {};

	var guid = generate.uid();
	socket.onopen = function() {
		constructObject();
	}
	socket.emit = function(action, callback) {
		callbacks[action.id] = callback;
		socket.send(JSON.stringify(action));
	}

	function constructObject() {
		socket.onmessage = function(data) {
			data = cleanData(data);
			if(data.type === "init" && !initDone && data.id == guid){
				initDone = true;
				socket.session = data.session;
				callback(socket);
			}else{
				callbacks[data.id] = callback(data);
			}
			socket.onAction();
		};
		socket.send(JSON.stringify({
			id: guid,
			type:"init",
			time:new Date().getTime(),
			session: session || generate.uid(),
			resource: generate.uid()
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