/* eslint-env browser  */

"use strict";

(function() {
	var config = require("../client-config-defaults.js"),
		juri = require("juri")(),
		Validator = require("../lib/validator.js");

	function insertWidget() {
		var sb, style, iframe, container,
			embed = {},
			host = config.server.protocol + "//" + config.server.host;

		sb = window.scrollback = window.scrollback || {};

		sb.room = sb.room || ((sb.streams && sb.streams.length) ? sb.streams[0] : "scrollback");

		embed.form = sb.form || "toast";
		embed.nick = sb.nick || sb.suggestedNick;
		embed.minimize = (typeof sb.minimize === "boolean") ? sb.minimize : false;
		embed.origin = {
			protocol: location.protocol,
			host: location.host,
			path: location.pathname + location.search + location.hash
		};

		embed.titlebarColor = sb.titlebarColor;
		embed.titlebarImage = sb.titlebarImage;

		sb.room = new Validator(sb.room).sanitize({ defaultName: "scrollback" });

		// Insert required styles
		style = document.createElement("link");
		style.rel = "stylesheet";
		style.type = "text/css";
		style.href = host + "/s/dist/styles/embed.min.css";

		document.head.appendChild(style);

		iframe = document.createElement("iframe");

		if (embed.form === "canvas") {
			container = document.getElementById("scrollback-container");
		}

		if (!container) {
			embed.form = sb.embed = "toast";

			document.body.appendChild(iframe);
		} else {
			container.appendChild(iframe);
		}

		iframe.src = host + "/" + sb.room + (sb.thread ? "/" + sb.thread : "/all") + "?embed=" + juri.encode(embed);
		iframe.className = "scrollback-stream scrollback-" + embed.form + " " + ((sb.minimize && embed.form === "toast") ? " scrollback-minimized" : "");

		window.addEventListener("message", function(e) {
			var data;

			if (e.origin === host) {
				try {
					data = JSON.parse(e.data);
				} catch (err) {
					return;
				}

				switch (data.type) {
					case "activity":
						if (data.hasOwnProperty("minimize")) {
							iframe.className = iframe.className.replace(/\bscrollback-minimized\b/g, "").trim();

							if (data.minimize) {
								iframe.className += " scrollback-minimized";
							}
						}
					break;
					case "domain-challenge":
						iframe.contentWindow.postMessage(JSON.stringify({
							type: "domain-response",
							token: data.token
						}), host);
					break;
				}
			}
		}, false);
	}

	if (document.readyState === "complete") {
		// document is already fully loaded. do our work
		insertWidget();
	} else {
		// document is not ready, wait till it's loaded
		document.addEventListener("readystatechange", function() {
			if (document.readyState === "complete") {
				insertWidget();
			}
		}, false);
	}
})();
