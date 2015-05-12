/* global createConnection, word, uid, assert */
/* jshint mocha: true */
/* jshint node: true */

describe("Action: ROOM", function(){
	this.timeout(20000);
	var roomId=word(7);
	var socketGustav, socketAnklebiter, socketOakley;
	it("Gustav creates a room", function(done) {
		socketGustav = createConnection("gustav", function(socketGustav) {
			var room = {
				id: roomId,
				params: {},
				guides: {},
				identities: []
			};
			var roomEvent = {
				room: room,
				type: "room",
				to: room.id,
			};
			roomEvent.id = uid();
			socketGustav.emit(roomEvent, function(res) {
				assert(res.type==="room" && res.session===socketGustav.session, 
				"Room creation looks invalid!");
				done();
				socketGustav.close();
			});
		});
	});

	it("Anklebiter enters a room whose owner is Gustav", function(done) {
		socketGustav = createConnection("gustav", function(socketGustav) {
			socketGustav.emit({
				id: uid(),
				"from": "gustav",
				"type": "back",
				"to": roomId
			}, function(){
				socketAnklebiter = createConnection("anklebiter", function(socketAnklebiter) {
					var id = uid();
					var thingsFinished = 0;
					socketGustav.on(id, function(action){
						assert(action.type==="back" && action.from==="anklebiter", 
							"Gustav didn't hear that Anklebiter entered some room!");
						thingsFinished++;
						if(thingsFinished === 2) done();
					});
					socketAnklebiter.emit({
						id: id, 
						type: "back", 
						to: roomId, 
						from:"anklebiter"
					}, function(action) {
						assert(action.type==="back" && action.from==="anklebiter", 
							"Anklebiter didn't hear that Anklebiter entered some room!");
						thingsFinished++;
						if(thingsFinished === 2) done();
					});
				});
			});
		});
	});

	it("Gustav does getUsers role=owner", function(done){
		socketGustav = createConnection("gustav", function(socket_gustav){
			socket_gustav.emit({
				type: "getUsers",
				role: "owner",
				id: uid(),
				memberOf: roomId
			}, function(action){
				assert(action.results[0].id==="gustav", 
					"Looks like Gustav is not the owner of room in question!");
				done();
			});
		});
	});

	it("Anklebiter follows (joins) a room whose owner is Gustav", function(done){
		this.timeout(10000);
		socketGustav = createConnection("gustav", function(socketGustav){
			socketGustav.emit({
				id: uid(),
				"from": "gustav",
				"type": "back",
				"to": roomId
			}, function(){
				socketAnklebiter = createConnection("anklebiter", function(socketAnklebiter){
					socketAnklebiter.emit({ 
						id: uid(),
						to: roomId, 
						from: "anklebiter",
						type: "back" 
					}, function () {
						var id = uid();
						var thingsFinished = 0;
						socketGustav.on(id, function(action){
							assert(action.from==="anklebiter" && action.role==="follower", 
								"Looks like Gustav didn't hear Anklebiter follow his room!");
							thingsFinished++;
							if(thingsFinished === 2) done();
						});

						socketAnklebiter.emit({
							id: id,
							role: "follower",
							type: "join",
							to: roomId,
							from: "anklebiter"
						}, function(action){
							assert(action.from==="anklebiter" && action.to===roomId, 
								"Looks like Anklebiter's follow failed!");
							socketGustav.emit({
								id: uid(),
								type: "getUsers",
								occupantOf: roomId,
							}, function(action){
								assert(action.results[0].id==="anklebiter", 
									"Looks like Anklebiter isn't in Gustav's room!");
								thingsFinished++;
								if(thingsFinished === 2) done();
							});
						});
					});
				});
			});
		});
	});

	it("Anklebiter unfollows (parts) a room", function(done){
		var specialId = uid();
		var thingsFinished=0;
		// make Oakley login to Scrollback
		socketOakley = createConnection("oakley", function(socketOakley){
			assert(socketOakley.user.id==="oakley", "Oops, looks like Oakley didn't login to Scrollback!");
			// make Gustav login to scrollback and enter some room
			console.log("About to create connection for Gustav");
				socketGustav = createConnection("gustav", function(socketGustav){
				socketGustav.emit({
					id: uid(),
					from: "gustav",
					type: "back",
					to: roomId
				}, function(results){
					console.log("About to create connection for Anklebiter");
					assert(results.from==="gustav" && results.to===roomId,
					"Oops! Looks like gustav wasn''t able to enter a room he created");
					createConnection("anklebiter", function(socketAnklebiter){
						console.log("about to enter", roomId);
						socketAnklebiter.emit({
							id: uid(),
							type: "back",
							to: roomId,
							from: "anklebiter"
						}, function(results){
							console.log(results);
							assert(results.from==="anklebiter" && results.to===roomId, 
							"Oops! looks like Anklebiter wasn't able to enter a room");

							console.log("About to do a join");

							socketAnklebiter.emit({
								id: uid(),
								type: "join",
								to: roomId,
								from: "anklebiter"
							}, function(results){
								assert(results.from==="anklebiter" && results.to===roomId && results.role==="follower",
								"Oops! looks like Anklebiter wasn't able to follow a room");

								console.log("About to test unfollow");

								// Gustav must hear unfollow 
								socketGustav.on(specialId, function(results){
									console.log("Gustav heard:", results);
									thingsFinished++;
									if (thingsFinished === 2) done();
								});

								// Anklebiter does a unfollow
								socketAnklebiter.emit({
									id: specialId,
									role: "none",
									type: "part",
									to: roomId,
									from: "anklebiter"
								}, function(results){
									console.log("Anklebiter heard", results);
									assert(results.from==="anklebiter" && results.to===roomId,
									"Oops! Looks like Anklebiter couldn't unfollow a room");
									thingsFinished++;
									if (thingsFinished === 2) done();	
								});
							});
						});
					});
				});
			});
		});
	});
});