/* jslint browser: true, indent: 4, regexp: true*/
/* global require*/

var config = require("../client-config.js");
var host = config.server.protocol + "//" + config.server.host;
var iframeCount = 0,
	widgets = {};

function guid(n) {
	var str = "",
		i;
	n = n || 32;
	for (i = 0; i < n; i++) str += (Math.random() * 36 | 0).toString(36);
	return str;
}

var domReady = (function() {
	var ready = document.readyState === "complete",
		listeners = [],
		fun;

	if (!ready) {
		document.addEventListener("readystatechange", function() {
			if (document.readyState === "complete") {
				ready = true;
				while (listeners.length) {
					listeners.splice(0, 1)[0]();
				}
			}
		});
	}

	fun = function(cb) {
		if (ready) return cb();
		listeners.push(cb);
	};

	return fun;
}());

function onMessage(e) {
	var data, frames, i, l, widgetID;
	if (e.origin !== host) return;
	frames = document.getElementsByTagName('iframe');

	for (i = 0, l = frames.length; i < l; i++) {
		if (frames[i].contentWindow === e.source) {
			widgetID = frames[i].dataset.id;
			break;
		}
	}
	if (i == l) return;
	try {
		data = JSON.parse(e.data);
	} catch (e) {
		return;
	}

	widgets[widgetID].message(data);

	/**/
}
window.addEventListener("message", onMessage, false);

function addStyles() {
	var style;
	style = document.createElement("link");
	style.rel = "stylesheet";
	style.type = "text/css";
	style.href = host + "/s/styles/dist/embed.css";
	document.head.appendChild(style);
}

domReady(function() {
	addStyles();
});

function constructEmbed(options) {
	var embed = {};

	embed.roomName = options.roomName;
	embed.form = options.form || "toast";
	if (options.nick) embed.nick = options.nick;
	embed.minimize = (typeof options.minimize === "boolean") ? options.minimize : false;
	if(options.tab) embed.tab = options.tab;
	if(options.mode) embed.mode = options.mode;
	if(options.time) embed.time = options.time;
	if(options.jws) embed.jws = options.jws;
	if(typeof options.createRoom == "boolean")embed.createRoom = options.createRoom;
	if(typeof options.createUser == "boolean")embed.createUser = options.createUser;
	embed.origin = {
		protocol: location.protocol,
		host: location.host,
		path: location.pathname + location.search + location.hash
	};
	return embed;
}

function addWidget(self) {
	var iframe, options = self.options,
		embed = self.embed, params = [];

	["tab", "time","dialog"].forEach(function(ops) {
		if(embed[ops]) {
			params.push(ops + "=" + embed[ops]);
			delete embed[ops];
		}
	});

	params.push("embed=" + encodeURIComponent(JSON.stringify(embed)));

	iframe = document.createElement("iframe");
	iframe.src = host + "/" + options.roomName + (options.thread ? "/" + options.thread : "") + "?"+params.join("&");
	iframe.className = "scrollback-stream scrollback-" + embed.form + " " + ((embed.minimize && embed.form == "toast") ? " scrollback-minimized" : "");
	iframe.dataset.id = ++iframeCount;


	console.log("IFRAME:", iframe.src);
	widgets[iframe.dataset.id] = self;
	// temp thing. implement better way to position these things.
	if (Object.keys(widgets).length > 1) {
		iframe.style.left = 50;
	}
	domReady(function() {
		var container = document.getElementById(self.options.container);
		if (!container) {
			embed.form = "toast";
			document.body.appendChild(iframe);
		} else {
			container.appendChild(iframe);
		}
	});

	return iframe;
}

function scrollback(opts, callback) {
	var widget = {},
		ready, self = {
			pendingCallbacks: {},
			options: {},
			state: {},
			iframe: null,
			embed: null,
			config: config
		};

	self.options = opts;
	// for now.
	if (iframeCount >= 1) throw new Error("Error: Cannot have multiple widgets on the same page.");

	self.embed = constructEmbed(opts);
	self.membership = [];
	self.emit = function(type, data, cb) {
		var post = {};
		post.id = guid();
		post.type = type;
		post.data = data;
		console.log(this);
		this.iframe.contentWindow.postMessage(JSON.stringify(post), host);
		self.pendingCallbacks[post.id] = cb;
	};
	widget.navigation = require("./navigation.js")(self);
	/*widget.following = require("./following.js")(self);
	widget.options = require("./options.js")(self);
	widget.signin = require("./signin.js")(self);*/
	self.widget = widget;

	self.iframe = addWidget(self);
	if (!self.embed) return;

	self.message = function(message) {
		switch (message.type) {
			case "activity":
				if (message.hasOwnProperty("minimize")) {
					var minReg = /\bscrollback-minimized\b/;

					if (message.minimize && !minReg.test(this.iframe.className)) {
						this.iframe.className = this.iframe.className + " scrollback-minimized";
					} else {
						this.iframe.className = this.iframe.className.replace(minReg, "").trim();
					}
				}
				break;
			case "domain-challenge":
				this.iframe.contentWindow.postMessage(JSON.stringify({
					type: "domain-response",
					token: message.token
				}), host);
				break;
			case "navigate":
				if (message.state.connectionStatus && !ready) {
					ready = true;
					if(callback) callback(null, widget);
				}
				self.state = message.state;
				break;
			case "following":

				break;
			case "membership":
				self.membership = message.data;
				break;
		}

		if (this.pendingCallbacks[message.id]) {
			if (message.type === "error") return this.pendingCallbacks[message.id](message);
			else this.pendingCallbacks[message.id](null, message);
		}
	};
}


window.scrollback = scrollback;
