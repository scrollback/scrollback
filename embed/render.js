
	// Create and append the iframe
	iframe = document.createElement("iframe");

	if (embed.form === "canvas") {
		container = document.getElementById("scrollback-container");
	}
	if (!container) {
		console.log("Toast");
		embed.form = sb.embed = "toast";
		document.body.appendChild(iframe);
	} else {
		console.log("canvas");
		container.appendChild(iframe);
		document.body.appendChild(container);
	}

	// TODO: change "embed" to "context"
	iframe.src = host + "/" + sb.room + (sb.thread ? "/" + sb.thread : "") + "?embed=" + encodeURIComponent(JSON.stringify(embed));
	iframe.className = "scrollback-stream scrollback-" + embed.form + " " + ((sb.minimize && embed.form == "toast") ? " scrollback-minimized" : "");
	window.addEventListener("message", function (e) {
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
};