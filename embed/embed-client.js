/* jshint browser: true */
/* global $, libsb*/

var Color = require("../lib/color.js"),
    generate = require('../lib/generate.js'),
	urlUtils = require("../lib/url-utils.js"),
	stringUtils = require("../lib/string-utils.js"),
	verificationStatus = false,
	parentWindow = null,
	bootingDone = false,
	verified = false,
	verificationTimeout = false,
	isEmbed = false,
	suggestedNick, jws,
	embed, token, domain, path, preBootQueue = [],
	parentHost, createRoom, createUser, domainSessions = {};

function openFullView() {
	window.open(stringUtils.stripQueryParam(window.location.href, "embed"), "_blank");
}

function sendDomainChallenge() {
	token = Math.random() * Math.random();
	parentHost = embed.origin.protocol + "//" + embed.origin.host;
	parentWindow.postMessage(JSON.stringify({
		type: "domain-challenge",
		token: token
	}), parentHost);

	setTimeout(function() {
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

	if (verificationTimeout) {
		return;
	}

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
		$("body").addClass("toast-minimized");
	}

	if (embed && embed.form) {
		$("body").addClass("embed-" + embed.form);
	}
}

function postNavigation(state, next) {
	var stateClone;

	if (state.source === "embed" && "minimize" in state) {
		if (state.minimize) {
			$("body").addClass("toast-minimized");
		} else {
			$("body").removeClass("toast-minimized");
		}

		parentWindow.postMessage(JSON.stringify({
			type: "activity",
			minimize: state.minimize
		}), parentHost);

	} else if (parentWindow) {
		stateClone = $.extend(true, {}, state);

		if (stateClone.room && stateClone.room.params) {
			delete stateClone.room.params;
		}

		parentWindow.postMessage(JSON.stringify({
			type: "navigate",
			state: stateClone
		}), parentHost);
	}

	next();
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

function generateCss(selector, styleBlock) {
	var r = [];
	r.push("\n" + selector + " {");

	for (var prop in styleBlock) {
		if (styleBlock[prop] instanceof Array) {
			for (var i = 0, l = styleBlock[prop].length; i < l; i++) {
				r.push(prop + ":" + styleBlock[prop][i] + "!important;");
			}
		} else {
			r.push(prop + ":" + styleBlock[prop] + "!important;");
		}
	}

	r.push("}");

	return r.join("\n");
}

function insertCss(embed) {
	var r = [], colorObj, titlebarFg;

	if (!embed) {
		return;
	}

	if (embed.titlebarColor) {
		colorObj =  new Color(embed.titlebarColor);

		if (colorObj.luma < 65) {
			titlebarFg = "#fff";
		} else {
			titlebarFg = "#333";
		}

		if (colorObj.saturation > 10) {
			r.push(generateCss(".custom-titlebar-sb-color", {
				"color": titlebarFg,
				"fill": titlebarFg
			}));
		}

		r.push(generateCss(".custom-titlebar-bg", {
			"background-color": embed.titlebarColor
		}));

		r.push(generateCss(".custom-titlebar-fg", {
			"color": titlebarFg,
			"fill": titlebarFg
		}));

		r.push(generateCss(".custom-titlebar-stroke", {
			"stroke": titlebarFg
		}));
	}

	if (embed.titlebarImage) {
		r.push(generateCss(".custom-titlebar-image", {
			"background-image": "url('" + embed.titlebarImage + "')",
			"background-repeat": "no-repeat",
			"background-position": "center",
			"background-size": [ "100%", "cover" ]
		}));
	}

	if (!r.length) {
		return;
	}

	$("head").append($("<style>").text(r.join(" ")));
}

module.exports = function(libsb) {
	$(function() {
		// Handle fullview button click
		$(".embed-action-fullview").on("click", openFullView);

		// Handle minimize and maximize
		$(".title-bar").on("click", function(e) {
			if ($("body").hasClass("toast-minimized")) {
				libsb.emit("navigate", {
					minimize: false,
					source: "embed",
					event: "minimize-bar"
				});
			} else if ((e.target === e.currentTarget) || $(e.target).closest(".embed-action-minimize").length) {
				libsb.emit("navigate", {
					minimize: true,
					view: "normal",
					source: "embed",
					event: "title-bar"
				});
			}
		});
	});

    var LS = window.localStorage || {};
    try {
        domainSessions = JSON.parse(LS.DomainSessions);
    } catch (e) {
        domainSessions = {};
    }

	var url = urlUtils.parse(window.location.pathname, window.location.search);
	embed = url.embed;
	if (window.parent !== window) {
		parentWindow = window.parent;
		if (embed) {
			isEmbed = true;
			suggestedNick = embed.nick;
			jws = embed.jws;
			createRoom = embed.createRoom;
			createUser = embed.createUser;
			classesOnLoad(embed);

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

	insertCss(embed);

	libsb.on("navigate", function(state, next) {
		function processNavigate() {
			var guides;

			if (state.source == "boot") {
				bootingDone = true;
				state.embed = embed;

				if ((navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
					 navigator.userAgent.match(/AppleWebKit/) &&
					 navigator.userAgent.match(/Safari/)) &&
					embed && embed.form === "toast"
				   ) {
					$(document).on("click", function(e) {
						if (!$(e.target).closest(".title-bar, .minimize-bar").length) {
							e.stopPropagation();

							openFullView();
						}
					});
				}
			}

			if (isEmbed && state.room && typeof state.room === "object") {
				guides = state.room.guides;
				if (guides && guides.allowedDomains && guides.allowedDomains.length) {
					if (!verified || guides.allowedDomains.indexOf(domain) == -1) {
						state.dialog = "disallowed";
					}
				}
			}
			next();
		}

		if (state.source == "boot") {
			if (!verificationStatus) {
				preBootQueue.push(function() {
				processNavigate();
				});
			} else {
				processNavigate();
			}
		} else {
			processNavigate();
		}

	}, 996);
	libsb.on("navigate", function(state, next) {
		if (isEmbed && state.source == "boot" && state.mode == "noroom") {
			if (createRoom) {
				state.dialog = "createroom";
			}else {
				state.dialog = "noroom";
			}
		}
		next();
	}, 995);
	libsb.on("init-up", function(init, next) {
		function processInit() {
			init.origin = {
				domain: domain,
				path: path,
				verified: verified
			};
            if (jws && !init.auth) {
                init.auth = {jws: jws};
            }

            if (domainSessions[domain]) {
                init.session = domainSessions[domain];
                libsb.session = init.session = domainSessions[domain];
            } else if (jws) {
                domainSessions[domain] = "web://" + generate.uid();
                window.localStorage.DomainSessions = JSON.stringify(domainSessions);
                libsb.session = init.session = domainSessions[domain];
            }

			if (url) {
				init.suggestedNick = init.suggestedNick || suggestedNick || "";
			}

			next();
		}

		if (verificationStatus) {
			processInit();
		} else {
			preBootQueue.push(processInit);
		}
	}, 500);

	libsb.on("navigate", postNavigation, 500);

	libsb.on("init-dn", function(init, next) {
		var membership = [];

		if (parentWindow) {
			if (!/^guest-/.test(init.user.id)) {
				init.memberOf.forEach(function(e) {
					if (!e.guides || !e.guides.allowedDomains || (e.guides.allowedDomains && e.guides.allowedDomains.indexOf(domain))) {
						membership.push(e.id);
					}
				});
				parentWindow.postMessage(JSON.stringify({
					type:"membership",
					data: membership
				}), parentHost);
			}
		}

		next();
	}, "watcher");
};
