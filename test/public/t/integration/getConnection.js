/* global uid */
/* jshint unused:false */

function getConnection(socket, user) {
	var init;
	if (user === "guest") {
		init = {
			"id": uid(),
			"type": "init",
			"to": "me",
			"session": "web://" + uid(),
			"resource": uid(),
			"origin": {
				host: "ck.scrollback.io",
				protocol: "https:",
				verified: true
			}
		};
	} else {
		init = {
			"auth": {
				testauth: user
			},
			"id": uid(),
			"type": "init",
			"to": "me",
			"session": "web://" + uid(),
			"resource": uid(),
			"origin": {
				host: "ck.scrollback.io",
				protocol: "https:",
				verified: true
			}
		};
	}
	socket.on("open", function() {
		socket.send(JSON.stringify(init));
	});
}
