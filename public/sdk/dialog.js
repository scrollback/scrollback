var dialog = (function () {
	var dialog, frame, callback, close = function(event, data) {
		dialog.style.display = "none";
		if("function" === typeof callback) callback(data);
	};
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
			
			frame.src = scrollback.host + url;
			dialog.style.display = "block";
		},
		hide: close
	};
}());

addEvent(window, "message", function(event) {
	var message;
	
	if(event.origin != scrollback.host) return;
	if(typeof event.data === 'string') {
		try { message = JSON.parse(event.data); }
		catch(e) {
			console.log("Error parsing incoming message: ", event.data, e);
			return;
		}
	} else { message = event.data; }
	
	switch(message.type) {
		case "CLOSE_DIALOG":
			dialog.hide(event, message.data);
			break;
	}
});