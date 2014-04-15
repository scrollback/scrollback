describe('Testing "BACK and away" Action.', function() {
	var users = [];
	describe('Testing "BACK" Action.', function() {
		describe('Validation text', function() {
			var sessionID = "t2crn8fyb9s7vwdiqml3rsti1bwed1xg";
			users.push(sessionID);

			it('when no To property in back', function(done) {
				getConnection(sessionID, function(c) {
					var guid, connection = c;
					guid = generate.uid();
					connection.emit({
						id: guid,
						type: "back"
					}, function(data) {
						if(data.id == guid && data.type !== "error") {
							throw new Error("Error Not Thrown");
						}else{
							assert.equal(data.message, "INVALID_ROOM", "Error message is incorrect");
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
						type: "away"
					}, function(data) {
						if(data.id == guid && data.type !== "error") {
							throw new Error("Error Not Thrown");
						}else{
							assert.equal(data.message, "INVALID_ROOM", "Error message is incorrect");
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
						if(data.id == guid && data.type !== "error") {
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
						if(data.id == guid && data.type !== "error") {
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
			it('Sending back for user1 on scrollback and expecting back on user0', function(done) {

				getConnection(users[0], function(c) {
					var guid, guid2, connection = c;
					guid = generate.uid();
					guid2 = generate.uid();
					c.onAction = function(data) {
						console.log(data);
						if(data.id == guid2) done();
					};
					console.log("sending back on user0");
					connection.emit({
						id: guid,
						type: "back",
						to: "scrollbackteam"
					}, function(data){
						var x = generate.uid();
						console.log("got back on user0", x);
						getConnection(x , function(c) {
							var guid, connection = c;
							users.push(c.session);
							console.log("got emitting back on user1");
							connection.emit({
								id: guid,
								type: "back",
								to: "scrollbackteam"
							}, function(data){
								console.log("got back");
								if(data.id == guid && data.error){
									throw new Error("Error Thrown");
								}
							});
						});
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
	});
});



