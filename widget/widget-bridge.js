/* jslint browser: true, indent: 4, regexp: true  */

var core, config, store, parentHost, parentWindow,
	embedPath, embedProtocol, verificationStatus,
	verificationTimeout, verified, bootNext, domain, path, token, isEmbed = false, suggestedNick;

module.exports = function(c, conf, s) {
	core = c;
	config = conf;
	store = s;

	if (window.parent !== window) {
		parentWindow = window.parent;
		isEmbed = true;
	} else {
		domain = location.hostname;
		path = location.path;
		verified = true;
		verificationStatus = true;
	}
	window.onmessage = onMessage;
	core.on("boot", function(changes, next) {
		var embed;
		if (changes.context && changes.context.env == "embed") {
			embed = changes.context.embed;
			parentHost = embed.origin.host;
			embedPath = embed.origin.path;
			embedProtocol = embed.origin.protocol;
			suggestedNick = embed.nick;
			sendDomainChallenge();
			bootNext = next;
		} else {
			next();
		}
	}, 800);
	
	
	core.on("statechange", function(changes, next) {
		if(changes.app && changes.app.bootComplete && store.getContext("embed")) {
			parentWindow.postMessage(JSON.stringify({
				type: "ready"
			}), parentHost);
		}
		if(changes.context && changes.context.embed && typeof changes.context.embed.minimize == "boolean") {
			parentWindow.postMessage(JSON.stringify({
				type: "activity",
				minimize: changes.context.embed.minimize
			}), parentHost);
		}
		next();
	}, 500);
	
	core.on("init-up", function(init, next) {
		var context = store.getContext("embed"), jws;
		if(context  && context .jws) jws = context.jws;
		if(!init.origin) init.origin = {};
		init.origin.domain = parentHost;
		init.origin.path = embedPath;
		init.origin.verified = verified;
		if(jws && !init.auth) {
			init.auth = {
				auth : {
					jws: jws
				}
			};
		}
		if(suggestedNick) init.suggestedNick = suggestedNick;
		next();
	}, 999);
	
};

function sendDomainChallenge() {
	token = Math.random();
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
		if(bootNext){
			bootNext();
			bootNext = null;
		}
	}, 1000);
}

function verifyDomainResponse(data) {
	if (verificationTimeout) {
		return;
	}

	if (data.token == token) {
		verified = true;
	} else {
		verified = false;
	}

	verificationStatus = true;
	if(bootNext){
		bootNext();
		bootNext = null;
	}
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
	case "following":
			if (action.follow) {
				core.emit("join-up", {to: action.room, role: "follower"});
			} else {
				core.emit("part-up", {to: action.room});
			}
		break;
	case "signin":
			actionUp.auth = {};
			actionUp.auth.jws = action.jws;

			if (action.nick) {
				action.auth.nick = action.nick; // TODO: can be used to generated nick suggestions.
			}

			core.emit("init-up", actionUp);
		break;
	}
}