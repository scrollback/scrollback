/* jshint browser: true */
/* global $, libsb*/
var parseURL = require("../lib/parseURL.js");

/*  status flags.*/
var verificationStatus = false,
	bootingDone = false,
	verified = false,
	verificationTimeout = false,
	suggestedNick, parentWindow;

/*  lasting objects*/
var embed, token, domain, path, preBootQueue = [],
	queue = [],
	parentHost, parentWindow;

function sendDomainChallenge() {
	token = Math.random() * Math.random();
	parentHost = embed.origin.protocol + "//" + embed.origin.host;
	parentWindow.postMessage(JSON.stringify({
		type: "domain-challenge",
		token: token
	}), parentHost);

	setTimeout(function () {
		if (!verificationStatus) {
			verificationStatus = true;
			verified = false;
			verificationTimeout = true;
			while (preBootQueue.length) {
				(preBootQueue.shift())();
			}
		}
	}, 1000);
}

function verifyDomainResponse(data) {
	domain = embed.origin.host;
	path = embed.origin.path;
	if (verificationTimeout) return;
	if (data.token == token) {
		verified = true;
	} else {
		verified = false;
	}
	verificationStatus = true;
	while (preBootQueue.length) {
		(preBootQueue.shift())();
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

function classesOnLoad(embed) {
	$("body").addClass("embed");
	if (embed.theme) {
		if (embed.theme == "dark") {
			$("body").addClass("theme-" + embed.theme);
		} else {
			$("body").removeClass("theme-dark");
			$("body").addClass("theme-" + embed.theme);
		}
	}
	if (embed.minimize) {
		$("body").addClass("minimized");
	}
	if (embed && embed.form) {
		$("body").addClass("embed-" + embed.form);
	}
}

function postNavigation(state, next) {
	var activity, stateClone = $.extend(true, {}, state);
	if (stateClone.source == "embed" && stateClone.hasOwnProperty("minimize")) {
		activity = {
			type: "activity",
			minimize: false
		};
		activity.minimize = state.minimize;
		if (stateClone.minimize) {
			$("body").addClass("minimized");
		} else {
			$("body").removeClass("minimized");
		}
		parentWindow.postMessage(JSON.stringify(activity), parentHost);
	}else if(parentWindow){
		if(stateClone.room && stateClone.room.params) delete stateClone.room.params;
		console.log(parentHost);
		parentWindow.postMessage(JSON.stringify({type:"navigate",state:stateClone}), parentHost);	
	}
	
	next();
}

function onMessage(e) {
	var data = e.data;
	data = parseResponse(data);
	switch (data.type) {
	case "domain-response":
		verifyDomainResponse(data);
		break;
	case "navigate":
		data.data.source = "parent";
		libsb.emit("navigate", data.data, function (err, state) {
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
		
		break;
	}
}

module.exports = function (libsb) {
	$(function () {
		// Handle fullview button click
		$(".embed-action-fullview").on("click", function () {
			window.open((window.location.href).replace(/[&,?]embed=[^&,?]+/g, ""), "_blank");
		});

		// Handle minimize
		$(".embed-action-minimize").on("click", function () {
			libsb.emit("navigate", {
				minimize: true,
				source: "embed",
				event: "action-minimize"
			});
		});

		$(".title-bar").on("click", function (e) {
			if (e.target === e.currentTarget) {
				libsb.emit("navigate", {
					minimize: true,
					source: "embed",
					event: "title-bar"
				});
			}
		});

		$(".minimize-bar").on("click", function () {
			libsb.emit("navigate", {
				minimize: false,
				source: "embed",
				event: "minimize-bar"
			});
		});
	});

	var url = parseURL(window.location.pathname, window.location.search);
	embed = url.embed;

	if (window.parent !== window) {
		parentWindow = window.parent;
		if (embed) {
			try {
				embed = JSON.parse(decodeURIComponent(url.embed));
			} catch (e) {
				embed = {};
			}

			suggestedNick = embed.nick;
			classesOnLoad(embed);

			if (embed.minimize) {
				$("body").addClass("minimized");
			}

			if (embed.origin) {
				window.onmessage = onMessage;
				sendDomainChallenge(embed.origin);
			} else {
				verificationStatus = true;
				verified = false;
			}
		} else {
			verificationStatus = true;
			verified = false;
		}
	} else {
		domain = location.hostname;
		path = location.path;
		verified = true;
		verificationStatus = true;
	}

	libsb.on("navigate", function (state, next) {
		function processNavigate() {
			var guides;
//				console.log("DATA:", {booted: libsb.hasBooted, verificationStatus: verificationStatus,verificationTimeout: verificationTimeout, verified: verified, domain: domain, path: path, state: state});
			if (state.source == "boot") {
				bootingDone = true;
				state.embed = embed;
			}

			if (state.room && state.room === "object") {
				guides = state.room.guides;
				if (!state.old || !state.old.roomName || state.roomName != state.old.roomName) {
					if (guides && guides.http && guides.http.allowedDomains && guides.http.allowedDomains.length) {
						if (!verified || guides.http.allowedDomains.indexOf(domain) == -1) state.room = 'embed-disallowed';
					}
				}
			}
			next();
		}

		if (state.source == "boot") {
			if (!verificationStatus) {
				preBootQueue.push(function () {
					processNavigate();
				});
			} else {
				processNavigate();
			}
		} else {
			processNavigate();
		}

	}, 997);

	libsb.on("init-up", function (init, next) {
		function processInit() {
			init.origin = {
				domain: domain,
				path: path,
				verified: verified
			};

			if (url) {
				init.suggestedNick = suggestedNick || "";
			}

			next();
		}
		if (libsb.hasBooted) processInit();
		else queue.push(processInit);
	}, 500);
	libsb.on("navigate", postNavigation, 500);
	
	libsb.on("init-dn", function(init, next) {
		var membership = [];
		if(!/^guest-/.test(init.user.id)) {
			init.memberOf.forEach(function(e) {
				if(!e.guides || (e.guides.domains && e.guides.domains.indexOf(domain))) {
					membership.push(e.id);
				}
			});
			parentWindow.postMessage(JSON.stringify({
				type:"membership",
				data: membership
			}));
		}
		next();
	}, "watcher");
};
