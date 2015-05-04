/* global uid, createConnection, sentence, assert, specialId, SocketOakley, socketAnklebiter, socketOakley */
/* jshint mocha: true */
/* jshint node: true */
 /*jshint unused:false*/

describe("Action: TEXT", function(){
	it("Anklebitter says 'Ruff!'", function(done){
		var SocketCrusoe, SocketOakley, socketAnklebiter;
		this.timeout(20000);
		var textMsg=sentence(5);
		var thingsFinished=0;
		var oakleyTimeout;
		var SocketGustav = createConnection("gustav", function(socketGustav){
			socketGustav.emit({
				id: uid(),
				from: "gustav",
				type: "back",
				to: "dachshundworld"
			}, crusoe);
		});
		function crusoe(){
			SocketCrusoe = createConnection("crusoe", function(socketCrusoe){
				socketCrusoe.emit({
					id: uid(),
					from: "crusoe",
					type: "back",
					to: "dachshundworld"
				}, oakley);
			});
		}
		function oakley(){
			SocketOakley = createConnection("oakley", function(socketOakley){
				var specialId=uid();
// 				socketOakley.emit({
// 					id: uid(),
// 					from: "oakley",
// 					type: "back",
// 					to: "dachshundworld"
// 				}, function(){});
				createConnection("anklebiter", function(socketAnklebiter){
					socketAnklebiter.emit({
						id: uid(),
						from: "anklebiter",
						type: "back",
						to: "dachshundworld"
					},function(results){
						assert(results.from==="anklebiter", "Oops! Looks like Anklebiter didn't enter the room: dachshundworld");
						SocketGustav.on(specialId, function(results){
								console.log("gustav heard:", results);
								console.log(thingsFinished++);
						});
						SocketCrusoe.on(specialId, function(results){
							console.log("crusoe heard:", results);
							console.log(thingsFinished++);
						});
						
						SocketOakley.on(specialId, function(results){
							console.log("oakley",results);
							clearTimeout(oakleyTimeout);
							closeConnections();
							assert(false, "why did i hear it? i am not even in the room");
						});

						socketAnklebiter.emit({
							id: specialId,
							type: "text",
							to: "dachshundworld",
							text: textMsg
						}, function(results) {
							assert(results.text===textMsg, "Oops! looks like anklebiter didn't hear back what he said");
							console.log(thingsFinished++);
						});
						oakleyTimeout = setTimeout(function() {
							thingsFinished++;
							closeConnections();
							if(thingsFinished === 4) done();
						}, 10000);
						function closeConnections(){
							SocketOakley.close();
							SocketCrusoe.close();
							SocketGustav.close();
							socketAnklebiter.close();
						}
					});
				});
			});
		}
	});
});

// describe("Action: EDIT", function(){
// 	it("Anklebiter enters and says 'Woof!' on DachshundWorld", function(done){
// 		var thingsFinished=0;

// 		var socketGustav = createConnection("gustav", function(socketGustav){
// 			console.log(socketGustav.user);
// 		});

// 		var socketOakley = createConnection("oakley", function(socketOakley){
// 			console.log(socketOakley.user);
// 		});

// 		createConnection("anklebiter", function(socketAnklebiter){
// 			socketAnklebiter.emit({
// 				id: uid(),
// 				type: "back",
// 				to: "dachshundworld",
// 				from: "anklebiter"
// 			}, function(results){
// 				console.log(results);
// 				socketAnklebiter.emit({
// 					id: uid(),
// 					type: "text",
// 					to: "dachshundworld",
// 					text: sentence(5)
// 				}, function(results){
// 					assert(results.from==="anklebiter" && results.to==="dachshundworld", 
// 					"Oops! Looks like anklebiter didn't hear himself say Woof!" );
// 					thingsFinished++;
// 					console.log("count:", thingsFinished);
// 					socketGustav.on("dachshundworld", function(results){
// 						console.log("socketGustav:", results);
// 						thingsFinished++;
// 						console.log("count:", thingsFinished);
// 						if (thingsFinished === 3) done();
// 					});
// 					socketAnklebiter.on("dachshundworld", function(results){
// 						console.log("socketAnklebiter:", results);
// 						thingsFinished++;
// 						console.log("count:", thingsFinished);
// 						if (thingsFinished === 3) done();
// 					});
// 					socketOakley.on("dachshundworld", function(results){
// 						console.log("socketOakley:", results);
// 						thingsFinished++;
// 						console.log("count:", thingsFinished);
// 						if (thingsFinished === 3) done();					
// 					});
// 				});
// 			});
// // 		socketAnklebiter.close();
// // 		socketGustav.close();
// // 		socketAnklebiter.close();
// 		});
// 		//Assert: Gustav hears "Woof!" on GustavsDachshundWorld
// 		//Assert: Oakley doesn't hear anything
// 		//Assert: Anklebiter hears "Woof!" on GustavsDachshundWorld
// 	});

// 	it("Gustav goes getTexts on DachshundWorld", function(){
// 		createConnection("gustav", function(socketGustav){
// 			socketGustav.emit({
// 				id: uid(),
// 				type: "getTexts",
// 				to: "dachshundworld",
// 				user: "anklebiter"
// 			},function(results){
// 				console.log(results.results);
// 				assert(results.type!="error", "Oops! Looks like Gustav didn't get a message he was looking for!");
// 			});
// 		});
// 	});
// });