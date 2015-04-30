/*global uid*/
function getConnection(socket, guest) {
	var init,
		sessionId = "web://" + uid();
	if (guest) {
		init = {
			"id": sessionId,
			"type": "init",
			"to": "me",
			"suggestedNick": "testinuser",
			"session": "web://" + uid(),
			"resource": uid(),
			"origin": {
				domain: "scrollback.io",
				verified: true
			}
		};
	}
	init = {
		"auth": {
			testauth: "chandra"
		},
		"id": sessionId,
		"type": "init",
		"to": "me",
		"suggestedNick": "testinuser",
		"session": "web://" + uid(),
		"resource": uid(),
		"origin": {
			domain: "scrollback.io",
			verified: true
		}
	};
	socket.onopen = function() {
		socket.send(JSON.stringify(init));
	};
}
