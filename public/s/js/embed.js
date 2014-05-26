/* jslint browser: true, indent: 4, regexp: true */

(function() {
	document.onreadystatechange = function() {
		if (document.readyState === "complete") {
			// Variables
			var room = "scrollback",
				host = "http://local.scrollback.io",
				embed = "toast",
				theme = "dark",
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
			iframe.src = host + "/" + room + "?embed=" + embed + "&theme=" + theme;
			iframe.className = "scrollback-stream";
			document.body.appendChild(iframe);

			// Add event listeners for post message
			var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
			var eventListener = window[eventMethod];
			var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

			// Listen to message from child iframe
			eventListener(messageEvent, function(e) {
				if (e.origin === "http://local.scrollback.io" && e.data === "minimize") {
					var className = "minimized",
						classString = iframe.className,
						nameIndex = classString.indexOf(className);

					if (nameIndex == -1) {
						classString += " " + className;
					} else {
						classString = classString.substr(0, nameIndex) + classString.substr(nameIndex + className.length);
					}

					iframe.className = classString;
				}
			}, false);
		}
	};
})();
