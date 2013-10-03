var dialog = (function () {
	var dialog, frame, callback, host = scrollback.host.replace(/^https?/, 'https');
	
	function close () {
		dialog.style.display = "none";
	};
	
	addEvent(window, "message", function(event) {
		var message;
		
		if(event.origin != host) return;
		if(typeof event.data === 'string') {
			try { message = JSON.parse(event.data); }
			catch(e) {
				scrollback.debug && console.log("Error parsing incoming message: ", event.data, e);
				return;
			}
		} else { message = event.data; }
		callback(message);
	});	
	
	return {
		show: function (url, cb) {
			callback = cb;
			if(!dialog) {
				dialog = JsonML.parse(["div", {
						"class": "scrollback-dialog-layer",
						onclick: close
					},
					[ "div", {"class": "scrollback-dialog"},
						["div", {"class": "scrollback-dialog-close scrollback-icon scrollback-icon-close",
							onclick: close}, "\u00d7"],
						["iframe", {"class": "scrollback-dialog-frame",
							allowtransparency: true,
							"id": "scrollback-dialog-frame", "frameborder": "0" }]
					]
				]);
				document.body.appendChild(dialog);
				frame = document.getElementById("scrollback-dialog-frame");
			}
			
			frame.src = host + url;
			dialog.style.display = "block";
		},
		hide: close,
		send: function(type, data) {
			frame.contentWindow.postMessage({
				type:type,
				data:data
			}, host);
		}
	};
}());

