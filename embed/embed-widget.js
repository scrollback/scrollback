/* jslint browser: true, indent: 4, regexp: true */

(function() {
	document.onreadystatechange = function() {
		var config = require("../client-config.js");

		if (document.readyState === "complete") {
			// Variables
			var room = window.scrollback.room || "scrollback",
				embed = window.scrollback.embed || "toast",
				theme = window.scrollback.theme || "dark",
				minimize = window.scrollback.minimize || false,
				host = config.server.protocol + config.server.host,
				style,
				iframe;

			// Insert required styles
			style = document.createElement("link");
			style.rel = "stylesheet";
			style.type = "text/css";
			style.href = host + "/s/styles/gen/embed.css";
			document.head.appendChild(style);

			// Create and append the iframe
			iframe = document.createElement("iframe");
			iframe.src = host + "/" + room + "?embed=" + embed + "&theme=" + theme + "&minimize=" + minimize;
			iframe.className = "scrollback-stream";
			document.body.appendChild(iframe);

			// Add event listeners for post message
			var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
			var eventListener = window[eventMethod];
			var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

			// Listen to message from child iframe
			eventListener(messageEvent, function(e) {
				if (e.origin === host) {
					if (e.data === "minimize" || e.data === "maximize") {
						var styleClass = "minimized",
							classString = iframe.className,
							nameIndex = classString.indexOf(styleClass);

						if (e.data === "minimize") {
							classString += " " + styleClass;
						} else if (nameIndex !== -1 && e.data === "maximize") {
							classString = classString.substr(0, nameIndex) + classString.substr(nameIndex + styleClass.length);
						}

						iframe.className = classString.trim();
					} else if (e.data === "getDomain") {
						iframe.postMessage({ location: window.location }, host);
					}
				}
			}, false);
		}
	};
})();
