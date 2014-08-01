/* jslint browser: true, indent: 4, regexp: true */

(function() {
	var config = require("../client-config.js");

	function validate(r, sanitize){
		var room;

		if (!r) { r = ""; }

		room = r.toLowerCase().trim()
				.replace(/[^a-zA-Z0-9]/g,"-").replace(/^-+|-+$/,"");

		if (!room || room === "img" || room === "css" || room === "sdk") {
			room = "scrollback";
		} else if (room.length < 3) {
			room = room + Array(4 - room.length).join("-");
		}

		room = room.substring(0,32);

		if (sanitize) {
			return room;
		} else {
			return room === r;
		}
	}

	document.onreadystatechange = function() {
		if (document.readyState === "complete") {
			// Variables
			var sb = window.scrollback || {},
				room = sb.room || ((sb.streams && sb.streams.length) ? sb.streams[0] : "scrollback"),
				embed = sb.embed || "toast",
				theme = /* sb.theme || */ "dark",
				minimize = (typeof sb.minimize === "boolean") ? sb.minimize : true,
				host = config.server.protocol + config.server.host,
				style, iframe, container;

			// Validate and sanitize room name
			room = validate(room, true);

			// Insert required styles
			style = document.createElement("link");
			style.rel = "stylesheet";
			style.type = "text/css";
			style.href = host + "/s/styles/gen/embed.css";

			document.head.appendChild(style);

			// Create and append the iframe
			iframe = document.createElement("iframe");

			if (embed === "canvas") {
				container = document.getElementById("scrollback-container");
			}

			// If there is no container in the parent page, fallback to toast style
			if (!container) {
				embed = sb.embed = "toast";

				document.body.appendChild(iframe);
			} else {
				container.appendChild(iframe);
			}

			iframe.src = host + "/" + room + "?embed=" + embed + "&theme=" + theme + "&minimize=" + minimize;
			iframe.className = "scrollback-stream scrollback-" + embed + " " + ((minimize && embed === "toast") ? "scrollback-minimized" : "");

			// Add event listeners for post message
			var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent",
				eventListener = window[eventMethod],
				messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

			// Listen to message from child iframe
			eventListener(messageEvent, function(e) {
				if (e.origin === host) {
					var minReg = /\bscrollback-minimized\b/;

					if (e.data === "minimize" && !minReg.test(iframe.className)) {
						iframe.className = iframe.className + " scrollback-minimized";
					} else if(e.data === "maximize") {
						iframe.className = iframe.className.replace(minReg, "").trim();
					} else if (e.data === "getDomain") {
						iframe.contentWindow.postMessage(JSON.stringify({ location: window.location }), host);
					}
				}
			}, false);
		}
	};
})();
