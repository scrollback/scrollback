/* global SockJS, scrollback, uid, assert, FB, gapi, error, navigator */
/* jshint mocha: true */
/* jshint node: true */

describe("Action: INIT:", function(){
	var socket;
	beforeEach(function(done){
		socket = new SockJS(scrollback.host+"/socket");
		socket.onopen=function(){done();};
	});
	afterEach(function(done){
		socket.close();
		done();
	});

	it("With sane properties", function(done){
		var sessionId = "web://"+uid();
		var init = {
		"id": sessionId,
		"type": "init",
		"to": "me",
		"suggestedNick": "anklebiter",
		"session": "web://"+uid(),
		"resource": uid(),
		"origin": {
			domain: "scrollback.io", 
			verified: true }
		};
		socket.onmessage = function(message){
			message = JSON.parse(message.data);
			assert(message.type!='error', "Init failed!");
			done();
		};
		socket.send(JSON.stringify(init));
	});

	it("Without 'session'", function(done){
		var init = {
		"id": uid(),
		"type": "init",
		"to": "me",
		"resource": uid(),
		"origin": {
					domain: "scrollback.io", 
					verified: true }
		};
		socket.onmessage = function(message){
			message = JSON.parse(message.data);
			assert(message.type=='error', "INIT without session happened!");
			done();
		};
		socket.send(JSON.stringify(init));
	});

	it("With existing 'session'", function(done){
		var pSocket = new SockJS(scrollback.host+"/socket");
		var sessionId = "web://"+uid();
		var user;
		pSocket.onopen=function(){
			var init = {
			"id": uid(),
			"session": "web://"+sessionId,
			"type": "init",
			"to": "me",
			"resource": uid(),
			"origin": {
						domain: "scrollback.io", 
						verified: true }
			};
			pSocket.onmessage = function(message){
				message = JSON.parse(message.data);
				user = message.user;
				var init = {
				"id": uid(),
				"session": "web://"+sessionId,
				"type": "init",
				"to": "me",
				"resource": uid(),
				"origin": {
							domain: "scrollback.io", 
							verified: true }
				};
				socket.onmessage = function(message){
					message = JSON.parse(message.data);
					// Expected: Get back existing USER object
					assert(message.user.id === user.id, "INIT with existing 'session' ID happened!");
					done();
				};
				socket.send(JSON.stringify(init));
			};
			pSocket.send(JSON.stringify(init));
		};
		pSocket.close();
		done();
	});

	it("With invalid characters in 'suggestedNick'", function(done){
				var init = {
				"id": uid(),
				"suggestedNick":'!#$%9some_invalid_nick',
				"type": "init",
				"to": "me",
				"resource": uid(),
				"origin": {
							domain: "scrollback.io", 
							verified: true }
				};
				socket.onmessage = function(message){
					message = JSON.parse(message.data);
					assert(message.type=='error', "INIT with invalid suggestedNick was created!");
					done();
				};
				socket.send(JSON.stringify(init));
	});

	// it("With existing 'session' and 'suggestedNick'", function(){});

	it("Facebook login with valid auth token", function(done){
		this.timeout(4000);
		setTimeout(done, 3700);
		var manualLogin = false;
		function statusChanged(response) {
			if (response.status === 'connected') {
					var sessionId = "web://"+uid();
					var init = {
					"auth": {
						"facebook": response.authResponse.accessToken
					},
					"id": sessionId,
					"type": "init",
					"to": "me",
					"suggestedNick": "gustavsDachshund",
					"session": "web://"+uid(),
					"resource": uid(),
					"origin": {
						domain: "scrollback.io", 
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

	it("Facebook login with invalid auth token", function(done){
		var sessionId = "web://"+uid();
		var init = {
		"auth": {
			"facebook": "398dkfhskjdfhj74i3758748"
		},
		"id": sessionId,
		"type": "init",
		"to": "me",
		"suggestedNick": "lena",
		"session": "web://"+uid(),
		"resource": uid(),
		"origin": {
			domain: "scrollback.io", 
			verified: true }
		};
		socket.onmessage = function(message){
			message = JSON.parse(message.data);
			assert(message.type!='error', "Facebook login with invalid auth token passed!");
			done();
		};
		socket.send(JSON.stringify(init));
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

	it("Google+ login with invalid auth token", function(done){
		var sessionId = "web://"+uid();
		var init = {
		"auth": {
			"google": "398dkfhskjdfhj74i3758748"
		},
		"id": sessionId,
		"type": "init",
		"to": "me",
		"suggestedNick": "apple",
		"session": "web://"+uid(),
		"resource": uid(),
		"origin": {
			domain: "scrollback.io",
			verified: true }
		};
		socket.onmessage = function(message){
			message = JSON.parse(message.data);
			assert(message.type!='error', "Google+ login with invalid auth token passed!");
			done();
		};
		socket.send(JSON.stringify(init));
	});

	it("Persona login with valid auth token", function(done){
		navigator.id.watch({
			onlogin: function(assertion){
			var sessionId = "web://"+uid();
					var init = {
					"auth": {
						"browser-id": assertion
					},
					"id": sessionId,
					"type": "init",
					"to": "me",
					"suggestedNick": "crusoe",
					"session": "web://"+uid(),
					"resource": uid(),
					"origin": {
						domain: "scrollback.io", 
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

	it("Persona login with invalid auth token", function(done){
		var sessionId = "web://"+uid();
		var init = {
		"auth": {
			"browser-id": "eyJwdWJs"
		},
		"id": sessionId,
		"type": "init",
		"to": "me",
		"suggestedNick": "oakley",
		"session": "web://"+uid(),
		"resource": uid(),
		"origin": {
			domain: "scrollback.io",
			verified: true }
		};
		socket.onmessage = function(message){
			message = JSON.parse(message.data);
			assert(message.type!='error', "Persona login with invalid assertion passed!");
			done();
		};
		socket.send(JSON.stringify(init));
	});
});