/* jslint browser: true, indent: 4, regexp: true */

(function() {
	document.onreadystatechange = function() {
		var config = require("../client-config.js");
        function validate(r, santize){
            var room;
            if(!r) r = "";
            room = r;
            room = room.toLowerCase();
            room = room.trim();
            room = room.replace(/[^a-zA-Z0-9]/g,"-").replace(/^-+|-+$/,"");
            if(room=='img'||room=='css'||room=='sdk') room = "scrollback";
            if(!room) { room = "scrollback";}
            else{
                if(room.length<3) room=room+Array(4-room.length).join("-");
            }
            room = room.substring(0,32);
            if(santize) return room;
            else return room === r;
        }
		if (document.readyState === "complete") {
			// Variables
			var room = window.scrollback.room || ((window.scrollback.streams && window.scrollback.streams.length) ? window.scrollback.streams[0] : "scrollback"),
				embed = window.scrollback.embed || "toast",
				theme = /* window.scrollback.theme || */ "dark",
				minimize = window.scrollback.minimize || false,
				host = config.server.protocol + config.server.host,
				style,
				iframe;

            room = validate(room, true);
			// Insert required styles
			style = document.createElement("link");
			style.rel = "stylesheet";
			style.type = "text/css";
			style.href = host + "/s/styles/gen/embed.css";
			document.head.appendChild(style);

			// Create and append the iframe
			iframe = document.createElement("iframe");
			iframe.src = host + "/" + room + "?embed=" + embed + "&theme=" + theme + "&minimize=" + minimize;
			iframe.className = "scrollback-stream " + (minimize? "scrollback-minimized" : "");
			document.body.appendChild(iframe);

			// Add event listeners for post message
			var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
			var eventListener = window[eventMethod];
			var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

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
