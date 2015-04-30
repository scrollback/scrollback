/*global uid*/
/*jshint unused:false*/

function getConnection(socket, user) {
	var init,
		sessionId = "web://" + uid();
	if (user === "guest") {
		init = {
			"id": sessionId,
			"type": "init",
			"to": "me",
			"suggestedNick": user,
			"session": "web://" + uid(),
			"resource": uid(),
			"origin": {
				domain: "scrollback.io",
				verified: true
			}
		};
	} else {
		init = {
			"auth": {
				testauth: user
			},
			"id": sessionId,
			"type": "init",
			"to": "me",
			//"suggestedNick": "testinuser",
			"session": "web://" + uid(),
			"resource": uid(),
			"origin": {
				domain: "scrollback.io",
				verified: true
			}
		};
	}
	socket.onopen = function() {
		socket.send(JSON.stringify(init));
	};
}
