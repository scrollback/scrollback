/* global assert, createConnection, error, socket, SockJS, scrollback, uid, FB, gapi, navigator */
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

describe("Action: INIT", function(){
	it("Facebook login with valid auth token", function(done){
	var socket = new SockJS(scrollback.host+"/socket");
	socket.onopen=function(){done();};
	this.timeout(4000);
	setTimeout(done, 3700);
	var manualLogin = false;
	function statusChanged(response) {
		if (response.status === 'connected') {
			var init = {
			"auth": {
				"facebook": response.authResponse.accessToken
			},
			"id": uid(),
			"type": "init",
			"to": "me",
			"suggestedNick": "appledachshund",
			"session": "web://"+uid(),
			"resource": uid(),
			"origin": {
				host: "scrollback.io", 
				verified: true }
			};
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				assert(message.type!='error', "Facebook login failed!");
				done();
			};
			socket.send(JSON.stringify(init));
		}
		else if (!manualLogin) {
			manualLogin = true;
			FB.login(statusChanged);
		} else {
			throw new error("FBLoginFailed");
		}
	}
		FB.init({
		appId      : '834799843281318',
		xfbml      : false,
		version    : 'v2.3'
		});
		FB.getLoginStatus(statusChanged);
	});

	it("Google+ login with valid auth token", function(done){
		this.timeout(4000);
		setTimeout(done, 3700);
		function statusChanged(authResult){
			if(authResult.error) throw Error("Google+ Failed");
			// console.log(authResult.access_token);
		}
		var additionalParams = {
			'clientid' : '780938265693-dqejsnmrevapt69q5mu32719fo3trupt.apps.googleusercontent.com',
			'callback': statusChanged,
			'cookiepolicy' : 'single_host_origin'
		};
		gapi.auth.signIn(additionalParams);
	});

	it("Persona login with valid auth token", function(done){
		navigator.id.watch({
			onlogin: function(assertion){
					var init = {
					"auth": {
						"browser-id": assertion
					},
					"id": uid(),
					"type": "init",
					"to": "me",
					"suggestedNick": "crusoe",
					"session": "web://"+uid(),
					"resource": uid(),
					"origin": {
						host: "scrollback.io", 
						verified: true }
					};
					socket.onmessage = function(message){
						message = JSON.parse(message.data);
						assert(message.type!='error', "Persona login failed!");
						done();
					};
					socket.send(JSON.stringify(init));
			}
		});

		navigator.id.request();
		done();
	});
});