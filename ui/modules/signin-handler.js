/* jshint browser: true */

var core, config, store, initSent;
module.exports = function(c, conf, s) {

	core = c;
	config = conf;
	store = s;

	window.addEventListener("message", function(event) {
		var data = event.data,
			action;

		if (event.origin !== "https://" + location.host) {
			return;
		}

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

		if (!data.command || data.command != "signin") {
			return;
		}

		sendInit(action);
	});

	function sendInit(action) {
		if (initSent) {
			return;
		}

		delete action.command;

		initSent = true;

		if (initSent) {
			core.emit('init-up', action, function() {
				initSent = false;
			});
		} else {
			initSent = false;
		}
	}

	window.addEventListener("login", function(e) {
		var auth = {}, data = e.detail;

		auth[data.provider] = {
			token: data.token
		};

		core.emit("init-up", {
			auth: auth
		});
	});
};
