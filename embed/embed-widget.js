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
			var sb, style, iframe,
				host = config.server.protocol + config.server.host;

			window.scrollback = window.scrollback || {};

			sb = window.scrollback;

			sb.room = sb.room || ((sb.streams && sb.streams.length) ? sb.streams[0] : "scrollback");
			sb.form = sb.form || "toast";
			sb.theme = /* sb.theme || */ "dark";
			sb.minimize = (typeof sb.minimize === "boolean") ? sb.minimize : true;

			sb.room = validate(sb.room, true);

			// Insert required styles
			style = document.createElement("link");
			style.rel = "stylesheet";
			style.type = "text/css";
			style.href = host + "/s/styles/gen/embed.css";

			document.head.appendChild(style);

			// Create and append the iframe
			iframe = document.createElement("iframe");
			iframe.src = host + "/" + sb.room + "?embed=" + encodeURIComponent(JSON.stringify(sb));
			iframe.className = "scrollback-stream" + (sb.minimize ? " scrollback-minimized" : "");

			document.body.appendChild(iframe);

			// Add event listeners for post message
			var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent",
				eventListener = window[eventMethod],
				messageEvent = (eventMethod === "attachEvent") ? "onmessage" : "message";

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
