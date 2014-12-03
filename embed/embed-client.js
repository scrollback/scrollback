/* jshint browser: true */
/* global $*/

var Color = require("../lib/color.js"),
	parseURL = require("../lib/parseURL.js"),
	stringUtils = require("../lib/stringUtils.js"),
	/* status flags */
	verificationStatus = false,
	bootingDone = false,
	verified = false,
	verificationTimeout = false,
	suggestedNick,
	/*  lasting objects*/
	embed, token, domain, path, preBootQueue = [],
	queue = [],
	parentHost;

function openFullView() {
	window.open(stringUtils.stripQueryParam(window.location.href, "embed"), "_blank");
}

function sendDomainChallenge() {
	token = Math.random() * Math.random();
	parentHost = embed.origin.protocol + "//" + embed.origin.host;

	window.parent.postMessage(JSON.stringify({
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

function toastChange(state, next) {
	if (state.source === "embed" && state.embed && state.embed.form === "toast" && state.hasOwnProperty("minimize")) {
		if (state.minimize) {
			$("body").addClass("toast-minimized");

			window.parent.postMessage("minimize", parentHost);
		} else {
			$("body").removeClass("toast-minimized");

			window.parent.postMessage("maximize", parentHost);
		}
	}
	next();
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

	var url = parseURL(window.location.pathname, window.location.search);

	embed = url.embed;

	if (window.parent !== window) {
		if (embed) {
			try {
				embed = JSON.parse(decodeURIComponent(url.embed));
			} catch (e) {
				embed = {};
			}

			suggestedNick = embed.nick;
			classesOnLoad(embed);

			if (embed.origin) {
				window.onmessage = function(e) {
					var data = e.data;
					data = parseResponse(data);
					if (data.type == "domain-response") {
						verifyDomainResponse(data);
					}
				};
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
					embed &&
					embed.form === "toast"
				   ) {
					$(document).on("click", function(e) {
						if (!$(e.target).closest(".title-bar, .minimize-bar").length) {
							e.stopPropagation();

							openFullView();
						}
					});
				}
			}

			if (state.room && state.room === "object") {
				guides = state.room.guides;
				if (!state.old || !state.old.roomName || state.roomName != state.old.roomName) {
					if (guides && guides.http && guides.http.allowedDomains && guides.http.allowedDomains.length) {
						if (!verified || guides.http.allowedDomains.indexOf(domain) == -1) {
							state.room = "embed-disallowed";
						}
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
	}, 997);

	libsb.on("init-up", function(init, next) {
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

		if (libsb.hasBooted) {
			processInit();
		} else {
			queue.push(processInit);
		}
	}, 500);

	libsb.on("navigate", toastChange, 500);
};
