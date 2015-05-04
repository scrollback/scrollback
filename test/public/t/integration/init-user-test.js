/* global assert, createConnection */
/* jshint mocha: true */
/* jshint node: true */

// Locally only Persona login works
// Creating account (first sign-in) is different from logging back to already created account.
// Logged in accounts should not have suggestedNick prefixed with "guest-"
// Initial DB State
// Used disposable email addresses to create Anklebiter, Crusoe, Oakley and Gustav accounts

describe("Action: INIT (testing existing USER accounts)", function(){
	it("Anklebiter connects to Scrollback", function(){
		createConnection("anklebiter", function(socketAnklebiter){
			assert(socketAnklebiter.user.id=="anklebiter", "Oops! Looks like Anklebiter did not get use USER oobject");
		});
	});
	it("Crusoe connects to Scrollback", function(){
		createConnection("crusoe", function(socketCrusoe){
			assert(socketCrusoe.user.id=="crusoe", "Oops! Looks like Crusoe did not get use USER oobject");
		});
	});
	it("Oakley connects to Scrollback", function(){
		createConnection("oakley", function(socketOakley){
			assert(socketOakley.user.id=="oakley", "Oops! Looks like Oakley did not get use USER oobject");
		});
	});
	it("Gustav connects to Scrollback", function(){
		createConnection("gustav", function(socketGustav){
			assert(socketGustav.user.id=="gustav", "Oops! Looks like Gustav did not get use USER oobject");
		});
	});
});

// describe("Action: INIT (testing for INVALID_INIT_PARAMS)", function(){
// 	it("GangstahHamstah tries to connect Scrollback (without a valid session)", function(){
// 		// `Assert: GangstahHamstah gets INVALID_INIT_PARAMS`
// 	});
// 	it("LonelyLab tries to connect to Scrollback (with Oakley's session)", function(){
// 		// `Assert: LonelyLab gets Oakley's USER object back`
// 	});
// 	it("BondaTheSpy tries to connect to Scrollback (with name as BondaThe$py)", function(){
// 		// `Assert: BondaTheSpy gets INVALID_INIT_PARAMS`
// 	});
// });

// describe("Action: INIT", function(){
// 	it("Apple connects to Scrollback (through Facebook)", function(){
// 		// `Assert: Apple's USER object is created, gets a new session (validate her Facebook login)`
// 	});
// 	it("Gabdu connects to Scrollback (through Google+)", function(){
// 		// `Assert: Gabdu's USER object is created, gets a new session (validate his Google+ login)`
// 	});
// 	it("Kariya connects to Scrollback (through Persona)", function(){
// 		// `Assert: Kariya's USER object is created, gets a new session (validate his e-mail login)`
// 	});
// });