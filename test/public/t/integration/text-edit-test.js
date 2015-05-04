/* global uid, createConnection, sentence, assert */
/* jshint mocha: true */
/* jshint node: true */

describe("Action: TEXT", function(){
	it("Anklebitter says 'Ruff!'", function(){
		createConnection("anklebiter", function(socketAnklebiter){
			var msgId = uid();
			socketAnklebiter.emit({
				id: msgId,
				type: "text",
				to: "dachshundworld",
				text: sentence(5)
			}, function(results){
				console.log(results.results);
			});
		});
		//Assert: Anklebiter hears his own "Ruff!" on GustavsDachshundWorld
		//Assert: Crusoe hears "Ruff!" from GustavsDachshundWorld
        //Assert: Gustav does getTexts on GustavsDachshundWorld and gets "Ruff!"
        // Assert: Oakley, LonelyLab15, Apple, Gabdu, Kariya do not hear anything
	});
});

describe("Action: EDIT", function(){
	it("Anklebiter enters and says 'Woof!' on DachshundWorld", function(done){
		var thingsFinished=0;

		var socketGustav = createConnection("gustav", function(socketGustav){
			console.log(socketGustav.user);
		});

		var socketOakley = createConnection("oakley", function(socketOakley){
			console.log(socketOakley.user);
		});

		createConnection("anklebiter", function(socketAnklebiter){
			socketAnklebiter.emit({
				id: uid(),
				type: "back",
				to: "dachshundworld",
				from: "anklebiter"
			}, function(results){
				console.log(results);
				socketAnklebiter.emit({
					id: uid(),
					type: "text",
					to: "dachshundworld",
					text: sentence(5)
				}, function(results){
					assert(results.from==="anklebiter" && results.to==="dachshundworld", 
					"Oops! Looks like anklebiter didn't hear himself say Woof!" );
					thingsFinished++;
					console.log("count:", thingsFinished);
					socketGustav.on("dachshundworld", function(results){
						console.log("socketGustav:", results);
						thingsFinished++;
						console.log("count:", thingsFinished);
						if (thingsFinished === 3) done();
					});
					socketAnklebiter.on("dachshundworld", function(results){
						console.log("socketAnklebiter:", results);
						thingsFinished++;
						console.log("count:", thingsFinished);
						if (thingsFinished === 3) done();
					});
					socketOakley.on("dachshundworld", function(results){
						console.log("socketOakley:", results);
						thingsFinished++;
						console.log("count:", thingsFinished);
						if (thingsFinished === 3) done();					
					});
				});
			});
// 		socketAnklebiter.close();
// 		socketGustav.close();
// 		socketAnklebiter.close();
		});
		//Assert: Gustav hears "Woof!" on GustavsDachshundWorld
		//Assert: Oakley doesn't hear anything
		//Assert: Anklebiter hears "Woof!" on GustavsDachshundWorld
	});

	it("Gustav goes getTexts on DachshundWorld", function(){
		createConnection("gustav", function(socketGustav){
			socketGustav.emit({
				id: uid(),
				type: "getTexts",
				to: "dachshundworld",
				user: "anklebiter"
			},function(results){
				console.log(results.results);
				assert(results.type!="error", "Oops! Looks like Gustav didn't get a message he was looking for!");
			});
		});
	});
//end
});