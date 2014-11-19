/* jshint browser:true */
/* global $, libsb */
var initSent = false;

$(window).on("message", function(event) {
	var data = event.originalEvent.data;
	var action;
	if (event.originalEvent.origin !== "https://" + location.host) return;
	if(initSent) return;
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
	delete data.command;
	initSent = true;
	libsb.emit("init-up", action, done);
});

$(window).on("phonegapmsg", function(e, p) {
	delete p.command;
	if(initSent) return;
	initSent = true;
	libsb.emit('init-up', p, done);
});



function done() {
	initSent = false;
}