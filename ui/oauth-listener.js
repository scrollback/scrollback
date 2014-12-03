/* jshint browser:true, node:true */
/* global $, libsb, currentState */
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
});

$(window).on("phonegapmsg", function(e, p) {
	sendInit(p);
});

function sendInit(action) {
	if (initSent) return;
	delete action.command;
	initSent = true;
	if (/^guest-/.test(libsb.user.id)) {
		libsb.emit('init-up', action, function() {
			initSent = false;
		});
	} else {
		initSent = false;
	}
}

var windowRef;

function getParameterByName(name, url) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(url);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

module.exports = function(authUrl, retVals) {
	if (typeof authUrl !== "string" || !(retVals instanceof Array)) {
		return;
	}
	windowRef = window.open(authUrl, "_blank", "location=no");
	if (currentState.phonegap) {
		var interval = setInterval(function() {
			windowRef.executeScript({
				code: "window.location.href;"
			}, function(ret) {
				var url = ret[0];
				var code = getParameterByName(retVals[0], url);
				if (code !== null) {
					var auth = {
						command: "signin",
						auth: {
							facebook: {
								code: code
							}
						}
					};
					$(window).trigger("phonegapmsg", [auth]);
					clearInterval(interval);
					windowRef.close();
				}
			});
		}, 100);
	}
};