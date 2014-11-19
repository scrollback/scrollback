/* jshint browser:true */
/* global $, libsb */
var initSent = false;

$(window).on("message", function(event) {
	var data = event.originalEvent.data;
	var action;
	if (event.originalEvent.origin !== "https://" + location.host) return;
	if (typeof data === 'string') {
		try {
			action = JSON.parse(data);
		} catch (e) {
			console.log("Error parsing incoming action: ", data, e);
			return;
		}
	} else {
		action = data;
	}

	if (!data.command || data.command != "signin") return;
	sendInit(action);
	sendInit(action);
});

$(window).on("phonegapmsg", function(e, p) {
	sendInit(p);
});

function sendInit(action) {
	if(initSent) return;
	delete action.command;
	initSent = true;
	if(/^guest-/.test(libsb.user.id)) {
		libsb.emit('init-up', action, function() {
			initSent = false;
		});
	}else{
		initSent = false;
	}
}


