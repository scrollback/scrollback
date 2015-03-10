var core, config, store, parentHost, parentWindow, embedPath,
	embedProtocol, verificationStatus, verificationTimeout, verified, bootNext;;

module.exports = function(c, conf, s) {
	
	core = c;
	config = conf;
	store = s;
	
	if (window.parent !== window) {
		parentWindow = window.parent;
	}else {
		domain = location.hostname;
		path = location.path;
		verified = true;
		verificationStatus = true;
	}
	
	core.on("boot", function(changes, next) {
		if(changes.context && changes.context.embed) {
			parentHost = changes.context.embed.domain;
			embedPath = changes.context.path;
			embedProtocol = changes.context.protocol;
			sendDomainChallenge();
			bootNext = next;
		}
		next();
	}, 1000);
};

function sendDomainChallenge() {
	token = Math.random() * Math.random();
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