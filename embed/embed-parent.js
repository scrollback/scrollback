/* jslint browser: true, indent: 4, regexp: true  */

(function() {
	var config = require("../client-config.js"),
		validate = require("../lib/validate.js");

	document.addEventListener("readystatechange", function() {
		var container;

		if (document.readyState === "complete") {
			// Add to iframe url: embed={minimize,path}
			var sb, style, iframe,
				embed = {},
				host = config.server.protocol + config.server.host;

			window.scrollback = window.scrollback || {};

			sb = window.scrollback;

			sb.room = sb.room || ((sb.streams && sb.streams.length) ? sb.streams[0] : "scrollback");

			embed.form = sb.form || "toast";
			embed.theme = /* sb.theme || */ "dark";
			embed.nick = sb.nick || sb.suggestedNick;
			embed.origin = {
				protocol: location.protocol,
				host: location.host,
				path: location.pathname + location.search + location.hash
			};
			embed.minimize = (typeof sb.minimize === "boolean") ? sb.minimize : false;
			embed.backgroundColor = sb.backgroundColor;
			embed.backgroundImage = sb.backgroundImage;

			sb.room = validate(sb.room, true);

			// Insert required styles
			style = document.createElement("link");
			style.rel = "stylesheet";
			style.type = "text/css";
			style.href = host + "/s/styles/dist/embed.css";

			document.head.appendChild(style);

			// Create and append the iframe
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

			// TODO: change "embed" to "context"
			iframe.src = host + "/" + sb.room + (sb.thread ? "/" + sb.thread : "") + "?embed=" + encodeURIComponent(JSON.stringify(embed));
			iframe.className = "scrollback-stream scrollback-" + embed.form + " " + ((sb.minimize && embed.form == "toast") ? " scrollback-minimized" : "");

			window.addEventListener("message", function(e) {
				var data;

				if (e.origin === host) {
					var minReg = /\bscrollback-minimized\b/;

					if (e.data === "minimize" && !minReg.test(iframe.className)) {
						iframe.className = iframe.className + " scrollback-minimized";
					} else if (e.data === "maximize") {
						iframe.className = iframe.className.replace(minReg, "").trim();
					} else {
						data = JSON.parse(e.data);
						if (data.type === "domain-challenge") {
							iframe.contentWindow.postMessage(JSON.stringify({
								type: "domain-response",
								token: data.token
							}), host);
						}
					}
				}
			}, false);
		}
	}, false);
})();
