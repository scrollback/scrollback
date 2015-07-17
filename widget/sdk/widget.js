/* eslint-env browser */

"use strict";

var config = require("../../client-config-defaults.js"),
	url = require("../../lib/url.js"),
	host = config.server.protocol + "//" + config.server.host,
	widgets = [];


// ----- Global methods -----

function parseMessage(data) {
	if(typeof data === "string") {
		try {
			data = JSON.parse(data);
		} catch (e) {
			data = {};
		}
	} else if(typeof data !== "object" || data === null) {
		data = {};
	}

	return data;
}

window.addEventListener("message", function (e) {
	var data, i;

	if (e.origin !== host) {
		return;
	}
	
	data = parseMessage(e.data);
	
	for(i = 0; i < widgets.length; i++) {
		if(widgets[i].iframe.contentWindow === e.source) {
			widgets[i].receiveMessage(data);
			break;
		}
	}
}, false);

function domReady(fn) {
	if (
		document.readyState === 'complete' ||
		document.readyState === 'loaded' ||
		document.readyState === 'interactive'
	) {
		fn();
	} else if (document.addEventListener) {
		document.addEventListener('DOMContentLoaded', fn, false);
	}
}

domReady(function() {
	var style = document.createElement("link");
	style.rel = "stylesheet";
	style.type = "text/css";
	style.href = host + "/s/dist/styles/embed.min.css";
	document.head.appendChild(style);
});

function insertIframe(state) {
	var embed = state.embed,
		iframe = document.createElement("iframe");

	iframe.src = host + url.build(state);

	domReady(function() {
		var container;
		if(embed.form === "canvas") {
			if((container = document.getElementById(embed.container))) {
				container.appendChild(iframe);
			} else {
				embed.form = "toast";
			}
		}
		
		if(embed.form === "toast") {
			document.body.appendChild(iframe);
		}
		
		iframe.className = "scrollback-stream scrollback-" + embed.form +
			(embed.minimize ? " scrollback-minimized" : "");
	});

	return iframe;
}

function copyProps(src, dst, props) {
	if(Array.isArray(dst)) {
		props = dst; dst = {};
	}
	props.forEach(function (prop) {
		if(typeof src[prop] !== "undefined") {
			dst[prop] = src[prop];
		}
	});
	return dst;
}

// ----- Widget class -----

function Widget (opts) {
	this.state = {};
	this.state.nav = copyProps(opts, ["room", "thread", "view", "mode", "dialog", "dialogState"]);
	this.state.context = {
		init: copyProps(opts, ["createRoom, createUser", "nick", "jws"]),
		embed: copyProps(opts, ["form", "minimize", "container", "alertSound", "alertTitle"]),
		origin: {
			protocol: location.protocol,
			host: location.host,
			path: location.pathname + location.search + location.hash
		}
	};
	
	if(opts.time) {
		this.state.nav[(opts.mode === "room" ? "thread" : "text") + "Range"] = { time: opts.time, before: 0, after: 20 };
	}
	
	this.iframe = insertIframe(this.state);
	widgets.push(this);
}

Widget.prototype.on = function(event, fn) {
	var eventMap = this.__events = this.__events || {};
	var handlerList = eventMap[event] = eventMap[event] || [];
	handlerList.push(fn);
};

Widget.prototype.off = function(event, fn) {
	var eventMap = this.__events = this.__events || {};
	var handlerList = eventMap[event];
	if (handlerList) {
		var index = handlerList.indexOf(fn);
		if (index >= 0) {
			handlerList.splice(index, 1);
		}
	}
};

Widget.prototype.emit = function() {
	var eventMap = this.__events = this.__events || {};
	var event = arguments[0];
	var handlerList = eventMap[event];
	if (handlerList) {
		for (var i = 0; i < handlerList.length; i++) {
			var fn = handlerList[i];
			fn.apply(this, arguments);
			if(fn.__once) {
				handlerList.splice(i, 1);
				i--;
			}
		}
	}
};

Widget.prototype.once = function (event, fn) {
	fn.__once = true;
	this.on(event, fn);
};

Widget.prototype.sendMessage = function (message, callback) {
	this.iframe.postMessage(JSON.stringify(message), host);
	if (typeof callback === "function") {
		this.once(message.type, callback);
	}
};

Widget.prototype.receiveMessage = function (message) {
	var type = message.type;
	switch (type) {
		case "minimize":
			this.iframe.className = this.iframe.className.replace(
				/\s*(\bscrollback-minimized\b|$)/,
				message.minimize? " scrollback-minimized": " "
			);
			break;
		case "domain-challenge":
			this.iframe.contentWindow.postMessage(JSON.stringify({
				type: "domain-response",
				token: message.token
			}), host);
			break;
		case "follow":
		case "auth":
		case "nav":
			delete message.type;
			this.state[type] = message;
			this.emit(message.type, message);
			return;
	}
};

Widget.prototype.navigation = function (state, callback) {
	if (typeof state === "undefined") {
		return this.state.nav;
	} else {
		state.type = "nav";
		this.sendMessage(state, callback);
	}
};

Widget.prototype.following = function (role, callback) {
	if (typeof role === "undefined") {
		return this.state.follow.role;
	} else {
		if (typeof role === "boolean") {
			role = role? "follower": "none";
		}
		this.sendMessage({ type: "follow", role: role }, callback);
	}
};

Widget.prototype.authentication = function (auth, callback) {
	if (typeof auth === "undefined") {
		return this.state.auth.status;
	} else {
		auth.type = "auth";
		this.sendMessage(auth, callback);
	}
};

module.exports = Widget;

