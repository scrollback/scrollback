/* jshint browser: true */
/* global $*/

var Color = require("../lib/color.js"),
	parseURL = require("../lib/parseURL.js"),
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
		$("body").addClass("minimized");
	}
	if (embed && embed.form) {
		$("body").addClass("embed-" + embed.form);
	}
}

function toastChange(state, next) {
	if (state.source === "embed" && state.embed && state.embed.form === "toast" && state.hasOwnProperty("minimize")) {
		if (state.minimize) {
			$("body").addClass("minimized");

			window.parent.postMessage("minimize", parentHost);
		} else {
			$("body").removeClass("minimized");

			window.parent.postMessage("maximize", parentHost);
		}
	}
	next();
}

function generateCss(selector, styleBlock) {
	var r = [];

	r.push(selector + "{");

	for (var prop in styleBlock) {
		r.push(prop + ":" + styleBlock[prop] + "!important;");
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

		if (colorObj.luma > 50) {
			titlebarFg = "rgba(255,255,255,.9)";
		} else {
			titlebarFg = "rgba(0,0,0,.9)";
		}

		if (colorObj.saturation < 10) {
			$("body").addClass("customization-titlebar-greyscale");
		}

		r.push(generateCss(".custom-titlebar-bg", { "background-color": embed.titlebarColor }));
		r.push(generateCss(".custom-titlebar-fg", { "color": titlebarFg }));
	}

	if (embed.backgroundImage) {
		r.push(generateCss(".custom-titlebar-image", { "background-image": "url('" + embed.titlebarImage + "')" }));
	}

	if (!r.length) {
		return;
	}

	$("head").append($("<style>").text(r.join(" ")));
}

module.exports = function(libsb) {
	$(function() {
		// Handle fullview button click
		$(".embed-action-fullview").on("click", function() {
			window.open((window.location.href).replace(/[&,?]embed=[^&,?]+/g, ""), "_blank");
		});

		// Handle minimize
		$(".embed-action-minimize").on("click", function() {
			libsb.emit("navigate", {
				minimize: true,
				source: "embed",
				event: "action-minimize"
			});
		});

		$(".titlebar").on("click", function(e) {
			if (e.target === e.currentTarget) {
				libsb.emit("navigate", {
					minimize: true,
					source: "embed",
					event: "titlebar"
				});
			}
		});

		$(".minimize-bar").on("click", function() {
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
