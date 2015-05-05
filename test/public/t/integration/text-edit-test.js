/* global uid, createConnection, sentence, assert, word, specialId, SocketOakley, socketAnklebiter, socketOakley */
/* jshint mocha: true */
/* jshint node: true */
 /*jshint unused:false*/

describe("Action: TEXT", function(){
	it("Anklebitter says 'Ruff!' and Gustav, Anklebiter heard it; Oakley didn't", function(done){
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
						assert(results.from==="anklebiter", 
						"Oops! Looks like Anklebiter didn't enter the room: dachshundworld");
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
							assert(results.text===textMsg, 
							"Oops! looks like anklebiter didn't hear back what he said");
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

describe("Action: EDIT", function(){
	it("Anklebiter enters and says 'Woof!' on DachshundWorld, edits his message. Gustav, Anklebiter hear the edit; Oakley doesn't", function(done){
		var thingsFinished=0;
		var SocketGustav, SocketOakley, SocketAnklebiter;
		
		//make oakley log-in to scrollback
		SocketOakley = createConnection("oakley", gustav);

		// make gustav join dachshundworld
		function gustav(){
			SocketGustav = createConnection("gustav", function(socketGustav){
				socketGustav.emit({
					id: uid(),
					from: "gustav",
					type: "back",
					to: "dachshundworld"
				}, anklebiter);
			});
		}

		// make anklebiter also enter the room
		function anklebiter(){
			createConnection("anklebiter", function(socketAnklebiter){
				var msgId=uid();
				socketAnklebiter.emit({
					id: uid(),
					type: "back",
					to: "dachshundworld",
					from: "anklebiter"
				}, function(results){
					socketAnklebiter.emit({
						id: msgId,
						type: "text",
						text: word(5),
						to: "dachshundworld"
					}, function(results){
						socketAnklebiter.emit({
							id: uid(),
							ref: msgId,
							type: "edit",
							text: "corrected",
							to: "dachshundworld"
						}, function(results){
							console.log(results);
						});
					});
				});
			});
		}
	});
});