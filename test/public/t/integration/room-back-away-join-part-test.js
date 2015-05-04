/* global createConnection, uid, assert */
/* jshint mocha: true */
/* jshint node: true */

describe("Action: ROOM", function(){
	this.timeout(20000);
	var roomId=uid();
	it("Gustav creates a room", function(done) {
		createConnection("gustav", function(socketGustav) {
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
			});
		});
	});

	it("Anklebiter enters a room whose owner is Gustav", function(done) {
		createConnection("gustav", function(socketGustav) {
			socketGustav.emit({
				id: uid(),
				"from": "gustav",
				"type": "back",
				"to": roomId
			}, function(){
				createConnection("anklebiter", function(socketAnklebiter) {
					var id = uid();
					var thingsFinished = 0;
					socketGustav.on(id, function(action){
						assert(action.type==="back" && action.from==="anklebiter", 
							"Gustav didn't hear that Anklebiter enter room!");
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
							"Anklebiter didn't hear that Anklebiter enter room!");
						thingsFinished++;
						if(thingsFinished === 2) done();
					});
				});
			});
		});
	}); 

	it("Gustav does getUsers role=owner", function(done){
		createConnection("gustav", function(socket_gustav){
			socket_gustav.emit({
				type: "getUsers",
				role: "owner",
				id: uid(),
				memberOf: roomId
			}, function(action){
				assert(action.results[0].id==="gustav", 
					"Looks like Gustav is not the owner of the room GustavsDachshundWorld!");
				done();
			});
		});
	});

	it("Anklebiter follows (joins) a room whose owner is Gustav", function(done){
		this.timeout(10000);
		createConnection("gustav", function(socketGustav){
			socketGustav.emit({
				id: uid(),
				"from": "gustav",
				"type": "back",
				"to": roomId
			}, function(){
				createConnection("anklebiter", function(socketAnklebiter){
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
							console.log("gustav heard join");
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
								"Looks like Anklebiter's Follow action failed!");
							console.log("join came back");
							socketGustav.emit({
								id: uid(),
								type: "getUsers",
								occupantOf: roomId,
							}, function(action){
								assert(action.results[0].id==="anklebiter", 
									"Looks like Anklebiter isn't in Gustav's room!");
								console.log("query finished");
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
		createConnection("anklebiter", function(socketAnklebiter){
			socketAnklebiter.emit({
						id: uid(),
						role: "none",
						type: "back",
						to: roomId,
						from: "anklebiter"
			}, function(action){
				console.log(action);
				done();
			});
		});
		// Gustav hears Anklebiter unfollowed a room
		// Oakley joins Scrollback
		// Assert: Oakley gets a new USER object, new session
		// Assert: Oakley doesn’t hear Anklebiter unfollowing a room
	});

// the end
});

