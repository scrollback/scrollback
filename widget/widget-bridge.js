/* jslint browser: true, indent: 4, regexp: true  */

var core, config, store, parentHost, parentWindow,
	embedPath, embedProtocol, verificationStatus,
	verificationTimeout, verified, bootNext, domain, path;

module.exports = function(c, conf, s) {
	core = c;
	config = conf;
	store = s;

	if (window.parent !== window) {
		parentWindow = window.parent;
	} else {
		domain = location.hostname;
		path = location.path;
		verified = true;
		verificationStatus = true;
	}

	core.on("boot", function(changes, next) {
		if (changes.context && changes.context.env == "embed") {
			parentHost = changes.context.domain;
			embedPath = changes.context.path;
			embedProtocol = changes.context.protocol;
			sendDomainChallenge();
			bootNext = next;
		}
		next();
	}, 1000);
};

function sendDomainChallenge() {
	var token = Math.random() * Math.random();
	verificationStatus = false;
	parentHost = embedProtocol + "//" + parentHost;
	parentWindow.postMessage(JSON.stringify({
		type: "domain-challenge",
		token: token
	}), parentHost);

	setTimeout(function() {
		if (!verificationStatus) {
			verificationStatus = true;
			verified = false;
			verificationTimeout = true;
		}
	}, 1000);
}

function verifyDomainResponse(data) {
	domain = embed.origin.host;
	path = embed.origin.path;

	if (verificationTimeout) {
		return;
	}

	if (data.token == token) {
		verified = true;
	} else {
		verified = false;
	}

	verificationStatus = true;
}

function parseResponse(data) {
	try {
		data = JSON.parse(data);
	} catch (e) {
		data = {};
	}

	return data;
}

function onMessage(e) {
	var data = e.data, action, actionUp = {};
	data = parseResponse(data);
	action = data.data;

	switch (data.type) {
	case "domain-response":
		verifyDomainResponse(data);
		break;
	case "navigate":
		data.data.source = "parent";
		libsb.emit("navigate", action, function(err, state) {
			var obj;
			if (err) {
				err.type = "error";
				err.id = data.id;
				parentWindow.postMessage(JSON.stringify(err), parentHost);
			} else {
				obj = {
					type: "navigate",
					id: data.id,
					state: state
				};
				parentWindow.postMessage(JSON.stringify(obj), parentHost);
			}

		});
		break;
	case "following":
			if (action.follow) {
				libsb.emit("join-up", {to: action.room, role: "follower"});
			} else {
				libsb.emit("part-up", {to: action.room});
			}
		break;
	case "signin":
			actionUp.auth = {};
			actionUp.auth.jws = action.jws;

			if (action.nick) {
				action.auth.nick = action.nick; // TODO: can be used to generated nick suggestions.
			}

			libsb.emit("init-up", actionUp);
		break;
	}
}
