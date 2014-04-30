describe('Testing "BACK and away" Action.', function() {
	var users = [];
	describe('Validation text', function() {
		var sessionID = "t2crn8fyb9s7vwdiqml3rsti1bwed1xg";
		users.push(sessionID);

		it('when no "to" property in back', function(done) {
			getConnection(sessionID, function(c) {
				var guid = generate.uid(), connection = c, m ={
					id: guid,
					type: "back",
					from: connection.user.id
				};
				connection.emit(m, function(data) {
					if(data.id == guid && data.type !== "error") {
						throw new Error("Error Not Thrown");
					}else{
						assert.equal(data.message, "INVALID_ROOM", "Error message is incorrect");
						done();
					}
				});
			});	
		});
		it('when no "from" property in back', function(done) {
			getConnection(sessionID, function(c) {
				var guid = generate.uid(), connection = c, m ={
					id: guid,
					type: "back",
					to: "scrollback"
				};
				connection.emit(m, function(data) {
					if(data.id == guid && data.type !== "error") {
						throw new Error("Error Not Thrown");
					}else{
						assert.equal(data.message, "INVALID_USER", "Error message is incorrect");
						done();
					}
				});
			});	
		});

		it('when no "to" property in away', function(done) {
			getConnection(sessionID, function(c) {
				var guid, connection = c;
				guid = generate.uid();
				connection.emit({
					id: guid,
					type: "away",
					from: connection.user.id
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

		it('No "from" property in away', function(done) {
			getConnection(sessionID, function(c) {
				var guid, connection = c;
				guid = generate.uid();
				connection.emit({
					id: guid,
					type: "away",
					to: "scrollback"
				}, function(data) {
					if(data.id == guid && data.type !== "error") {
						throw new Error("Error Not Thrown");
					}else{
						assert.equal(data.message, "INVALID_USER", "Error message is incorrect");
						done();
					}
				});
			});	
		});

		it('No "time" property in back', function(done) {
			getConnection(users[0], function(c) {
				var guid, connection = c;
				guid = generate.uid();
				connection.emit({
					id: guid,
					type: "back",
					to: "scrollback",
					from: connection.user.id,
				}, function(data){
					if(data.id == guid && data.type !== "error") {
						done();
					}else{
						alert(data.message);
						throw new Error("Error Thrown");
					}
				});
			})
		});

		it('No time property in away', function(done) {
			getConnection(users[0], function(c) {
				var guid, connection = c;
				guid = generate.uid();
				connection.emit({
					id: guid,
					type: "away",
					to: "scrollback",
					from: connection.user.id
				}, function(data){
					if(data.id == guid && data.type !== "error") {
						done();
					}else{
						alert(data.message);
						throw new Error("Error Thrown");
					}
				});
			})
		});
	});

	describe('Texting echo of back messages.', function() {
		var connection;
		it('Sending back for user1 on scrollback and expecting back on user0', function(done) {
			var user1 = false, user2 = false, user1BackId = generate.uid(), user2BackId = generate.uid(), connection1, connection2;
			getConnection(users[0], function(c) {
				connection1 = c;
				connection1.emit({
					id: generate.uid(),
					type: "back",
					to: "scrollback",
					from: connection1.user.id
				}, function(data) {
					if(user1) return;
					user1 = true;
					connection1.onAction = function(action) {
						if(action.id == user2BackId) done();
					};
					if(user1 && user2) {
						startTest();
					}
				})
				
			});

			getConnection(generate.uid(), function(c) {
				connection2 = c;
				users.push(c.session);
				user2 = true;
				if(user1 && user2){
					startTest();
				}
			});

			function startTest(){
				connection2.emit({
					id: user2BackId,
					type: "back",
					to: "scrollback",
					from: connection2.user.id
				}, function(data){
					if(data.id == guid && data.error){
						throw new Error("Error Thrown");
					}
				});
			}
		});


		it('Sending a second back message for user1 on scrollback. user0 should  not hear an echo.', function(done) {
			this.timeout(4000);
			var user1 = false, err = false, user2 = false, user1BackId = generate.uid(), user2BackId = generate.uid(), connection1, connection2;
			getConnection(users[0], function(c) {
				connection1 = c;
				connection1.emit({
					id: generate.uid(),
					type: "back",
					to: "scrollback",
					from: connection1.user.id
				}, function(data) {
					if(user1) return;
					user1 = true;
					connection1.onAction = function(action) {
						if(action.id == user2BackId){
							err = true;
							throw new Error("GOT back on second time.");	
						} 
					};
					if(user1 && user2) {
						startTest();
					}
				})
				
			});

			getConnection(users[1], function(c) {
				connection2 = c;
				user2 = true;
				if(user1 && user2){
					startTest();
				}
			});
			setTimeout(function(){
				(!err) && done();
			}, 3000);
			function startTest(){
				connection2.emit({
					id: user2BackId,
					type: "back",
					to: "scrollback",
					from: connection2.user.id
				}, function(data){
					if(data.id == guid && data.error) {
						err = true;
						throw new Error("Error Thrown");
					}
				});
			}
		});


		it('Sending a back message for user1 on node. user0 should not hear an echo.', function(done) {
			this.timeout(4000);
			var user1 = false,err = false, user2 = false, user1BackId = generate.uid(), user2BackId = generate.uid(), connection1, connection2;
			getConnection(users[0], function(c) {
				connection1 = c;
				connection1.emit({
					id: generate.uid(),
					type: "back",
					to: "scrollback",
					from: connection1.user.id
				}, function(data) {
					if(user1) return;
					user1 = true;
					connection1.onAction = function(action) {
						if(action.id == user2BackId) {
							err = true;
							throw new Error("GOT back on from wrong room.");	
						} 
					};
					if(user1 && user2) {
						startTest();
					}
				})
				
			});

			getConnection(users[1], function(c) {
				connection2 = c;
				user2 = true;
				if(user1 && user2){
					startTest();
				}
			});
			setTimeout(function(){
				(!err) && done();
			}, 3000);
			function startTest(){
				connection2.emit({
					id: user2BackId,
					type: "back",
					to: "node",
					from: connection2.user.id
				}, function(data){
					if(data.id == guid && data.error) {
						err = true;
						throw new Error("Error Thrown");
					}
				});
			}
		});

		it('Sending away for user1 on scrollback and expecting back on user0', function(done) {
			var user1 = false, user2 = false, user1BackId = generate.uid(), user2BackId = generate.uid(), connection1, connection2;
			this.timeout(3000);
			getConnection(users[0], function(c) {
				connection1 = c;
				connection1.emit({
					id: generate.uid(),
					type: "back",
					to: "scrollback",
					from: connection1.user.id
				}, function(data) {
					if(user1) return;
					user1 = true;
					connection1.onAction = function(action) {
						if(action.id == user2BackId) done();
					};
					if(user1 && user2) {
						startTest();
					}
				})
				
			});
			getConnection(users[1], function(c) {
				connection2 = c;
				users.push(c.session);
				user2 = true;
				if(user1 && user2){
					startTest();
				}
			});
			function startTest(){
				connection2.emit({
					id: user2BackId,
					type: "away",
					to: "scrollback",
					from: connection2.user.id
				}, function(data){
					if(data.id == guid && data.error){
						throw new Error("Error Thrown");
					}
				});
			}
		});
	});
});



