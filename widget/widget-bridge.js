var core, store, origin, bootNext, domain, jws, path, token, isEmbed = false, suggestedNick;


function postMessage(data) {
	var origin = store.get("context", "origin");
	
	if(!origin.verified || window.parent === window) return;
	
	if(window.Android) {
		window.Android.postMessage(JSON.stringify(data));
	else {
		window.parent.postMessage(data, orign.protocol + origin.host);
	}
}

module.exports = function(c, conf, s) {
	core = c;
	store = s;
	
	window.addEventListener("message", onMessage);
	
	core.on("boot", function(changes, next) {
		if (changes.context && changes.context.env === "embed" && changes.context.origin) {
			verifyDomain(origin, function () {
				changes.context.origin.verified = true;
				next();
			});
		} else {
			changes.context = changes.context || {};
			if (window.parent === window) {
				changes.context.origin = {
					host: location.hostname,
					path: location.path,
					protocol: location.protocol,
					verified: true
				};
			} else if(window.Android) {
				changes.context.env = "android";
				changes.context.origin = {
					host: window.Android.getPackageName(),
					path: "",
					protocol: "app:",
					verified: true
				};
			} else {
				// Iframe without embed?
				changes.context.env = "embed";
				changes.context.origin = {
					verified: false
				};
			}
			next();
		}
	}, 800);


	core.on("statechange", function(changes, next) {
		if(changes.app && changes.app.bootComplete) {
			postMessage({ type: "ready" });
		}
		if(changes.context && changes.context.embed && typeof changes.context.embed.minimize === "boolean") {
			postMessage({ type: "minimize", value: changes.context.embed.minimize });
		}
		next();
	}, 500);

	core.on("init-up", function(init, next) {
		var context = store.get("context", "embed"), jws;
		if(context  && context .jws) jws = context.jws;
		if(!init.origin) init.origin = {};
		init.origin.domain = domain;
		init.origin.path = embedPath || path;
		init.origin.verified = verified;
		if(jws && !init.auth) {
			init.auth = {
				jws: jws
			};
		}
		if(suggestedNick) init.suggestedNick = suggestedNick;
		next();
	}, 999);

	core.on("room-up", function(roomUp, next) {

		next();
	}, 1000);
};

function sendDomainChallenge() {
	token = Math.random();
	verificationStatus = false;
	domain = parentHost;
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

	if (data.token === token) {
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

function verifyMessage(event) {
	
}

function onMessage(e) {
	var data = e.data, room;
	
	if(!verifyMessage(e)) { return; }
	data = parseResponse(data);

	switch (data.type) {
		case "domain-response":
			verifyDomainResponse(data);
			break;
		case "auth":
			sendInit(data);
		case "follow":
			if (!(room = data.room || store.getRoom)) return;
			if (data.value === true) {
				core.emit("join-up", { to: room, role: "follower"});
			} else if(data.value === false) {
				core.emit("part-up", { to: room });
			}
		break;
	}
}



	window.addEventListener("message", function(event) {
		var data = event.data,
			action;

		if (event.origin !== "https://" + location.host) {
			return;
		}

		if (typeof data === 'string') {
			try {
				action = JSON.parse(data);
			} catch (e) {
				return;
			}
		} else {
			action = data;
		}

		if (!data.command || data.command !== "signin") {
			return;
		}

		sendInit(action);
	});

	function sendInit(action) {
		if (initSent) {
			return;
		}

		delete action.command;

		initSent = true;

		if (initSent) {
			core.emit('init-up', action, function() {
				initSent = false;
			});
		} else {
			initSent = false;
		}
	}

	window.addEventListener("login", function(e) {
		var auth = {}, data = e.detail;

		auth[data.provider] = {
			token: data.token
		};

		core.emit("init-up", {
			auth: auth
		});
	});
